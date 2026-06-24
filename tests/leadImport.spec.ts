import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { LeadPage } from '../src/pages/LeadPage';
import { readLeads } from '../src/services/fileSystem';
import * as fs from 'fs';

test('Import Leads From JSON', async ({ page }) => {
  test.setTimeout(10 * 60 * 1000);

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing Admin Credentials in .env file');
  }

  const filePath = process.env.FILE_PATH || './output/gmblead.json';
  const leads = readLeads(filePath);
  
  console.log(`Found ${leads.length} leads to import`);

  if (leads.length === 0) {
    console.log('No leads to process. Exiting.');
    return;
  }

  const loginPage = new LoginPage(page);
  const leadPage = new LeadPage(page);

  await loginPage.navigate();
  await loginPage.login(email, password);

  let successCount = 0;
  let failCount = 0;

  for (const lead of leads) {
    try {
      await leadPage.createLead(lead);
      console.log(`✅ Created Lead: ${lead.fullName}`);
      successCount++;
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed Lead: ${lead.fullName}`, errMessage);
      failCount++;
      
      // Safety break to prevent cascade failures on dead browser contexts
      if (errMessage.includes('Target page, context or browser has been closed') || errMessage.includes('Test ended')) {
        console.error('🛑 Critical failure: Browser context lost. Aborting pipeline.');
        break; 
      }
    }
  }

  console.log(`🎉 Import completed. Success: ${successCount}, Failed: ${failCount}`);

  // FIX: Safe Deletion Logic
  if (failCount === 0 && successCount > 0) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Successfully deleted source file: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error attempting to delete ${filePath}:`, error);
    }
  } else if (failCount > 0) {
    console.warn(`⚠️ WARNING: File ${filePath} was NOT deleted because ${failCount} leads failed. Fix the errors and rerun the import to prevent data loss.`);
  }
});