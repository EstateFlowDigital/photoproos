import { execSync } from 'child_process';
import { Pool } from 'pg';

const marketingAssetTypeValues = [
  'flyer_portrait',
  'flyer_landscape',
  'postcard_4x6',
  'postcard_5x7',
  'feature_sheet',
  'brochure',
  'window_sign',
  'yard_sign_rider',
  'door_hanger',
  'social_square',
  'social_landscape',
  'social_pinterest',
  'social_linkedin',
  'social_twitter',
  'social_story',
  'tile_just_listed',
  'tile_just_sold',
  'tile_open_house',
  'tile_price_reduced',
  'tile_coming_soon',
  'tile_under_contract',
  'tile_back_on_market',
  'tile_new_price',
  'tile_virtual_tour',
  'tile_featured',
  'video_slideshow',
  'video_reel',
  'video_tour_teaser',
  'video_neighborhood',
  'video_stats_animation',
  'email_banner',
  'email_template',
  'qr_code',
  'virtual_tour_poster'
] as const;

const socialTileStyleValues = [
  'modern',
  'classic',
  'luxury',
  'minimal',
  'bold',
  'elegant'
] as const;

async function ensureEnum(
  pool: Pool,
  enumName: string,
  values: readonly string[]
) {
  const enumCheck = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = $1
      ) AS exists;
    `,
    [enumName]
  );

  if (enumCheck.rows[0]?.exists) {
    return;
  }

  const serializedValues = values.map((value) => `'${value}'`).join(', ');
  await pool.query(`CREATE TYPE "${enumName}" AS ENUM (${serializedValues});`);
}

async function ensureMarketingTemplateTable(pool: Pool) {
  const tableCheck = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'MarketingTemplate'
    );
  `);

  if (tableCheck.rows[0]?.exists) {
    return;
  }

  console.log('MarketingTemplate table is missing, creating it now...');

  await ensureEnum(pool, 'MarketingAssetType', marketingAssetTypeValues);
  await ensureEnum(pool, 'SocialTileStyle', socialTileStyleValues);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "MarketingTemplate" (
      "id" TEXT PRIMARY KEY,
      "organizationId" TEXT,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "type" "MarketingAssetType" NOT NULL,
      "style" "SocialTileStyle" NOT NULL DEFAULT 'modern',
      "thumbnailUrl" TEXT,
      "canvasWidth" INTEGER NOT NULL,
      "canvasHeight" INTEGER NOT NULL,
      "templateData" JSONB NOT NULL,
      "category" TEXT,
      "tags" TEXT[] NOT NULL DEFAULT '{}',
      "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,
      "isPublic" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('Starting database migration...');

  // Connect to database to clean up duplicates before schema push
  const pool = new Pool({ connectionString: databaseUrl });
  let hadError = false;

  try {
    await ensureMarketingTemplateTable(pool);

    // Check if GalleryFavorite table exists AND has the selectionType column
    const columnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'GalleryFavorite'
        AND column_name = 'selectionType'
      );
    `);

    if (columnCheck.rows[0].exists) {
      console.log('Cleaning up duplicate GalleryFavorite records...');

      // Delete duplicates, keeping the most recent one
      const result = await pool.query(`
        DELETE FROM "GalleryFavorite" a
        USING "GalleryFavorite" b
        WHERE a."id" < b."id"
          AND a."projectId" = b."projectId"
          AND a."assetId" = b."assetId"
          AND (a."clientEmail" = b."clientEmail" OR (a."clientEmail" IS NULL AND b."clientEmail" IS NULL))
          AND a."selectionType" = b."selectionType";
      `);

      console.log(`Removed ${result.rowCount} duplicate records`);
    } else {
      console.log('GalleryFavorite table or selectionType column does not exist yet, skipping duplicate cleanup');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    hadError = true;
  } finally {
    try {
      await pool.end();
    } catch (closeError) {
      console.warn('Error closing database connection:', closeError);
    }
  }

  if (hadError) {
    process.exit(1);
  }

  // Now run prisma db push
  try {
    console.log('Applying schema changes...');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: process.env
    });
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
