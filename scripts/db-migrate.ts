import { execSync } from 'child_process';
import { Pool } from 'pg';

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('Starting database migration...');

  // Connect to database to clean up duplicates before schema push
  const pool = new Pool({ connectionString: databaseUrl });

  try {
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

    await pool.end();

    // Now run prisma db push
    console.log('Applying schema changes...');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: process.env
    });

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();
