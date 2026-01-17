/**
 * Seed CMS Components and Templates
 *
 * Run with: npx tsx scripts/seed-cms.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env file before any other imports
config({ path: resolve(__dirname, "../.env") });

// Dynamic imports to ensure env is loaded first
async function loadModules() {
  const { seedDefaultComponents } = await import("../src/lib/actions/cms-page-builder");
  const { seedDefaultTemplates } = await import("../src/lib/actions/cms-templates");
  return { seedDefaultComponents, seedDefaultTemplates };
}

async function main() {
  console.log("Seeding CMS components and templates...\n");

  // Load modules after env is configured
  const { seedDefaultComponents, seedDefaultTemplates } = await loadModules();

  // Seed components
  console.log("1. Seeding default components...");
  const componentsResult = await seedDefaultComponents();
  if (componentsResult.success) {
    console.log(`   ✓ Created ${componentsResult.data?.created} components\n`);
  } else {
    console.error(`   ✗ Failed to seed components: ${componentsResult.error}\n`);
  }

  // Seed templates
  console.log("2. Seeding default templates...");
  const templatesResult = await seedDefaultTemplates();
  if (templatesResult.success) {
    console.log(`   ✓ Created ${templatesResult.data?.created} templates\n`);
  } else {
    console.error(`   ✗ Failed to seed templates: ${templatesResult.error}\n`);
  }

  console.log("Done!");
}

main().catch(console.error);
