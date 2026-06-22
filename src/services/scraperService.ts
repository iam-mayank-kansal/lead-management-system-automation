import { Page } from '@playwright/test';
import { Lead } from '../types/lead.types';
import { enrichWebsiteData } from './enrichmentService';

export async function scrapeGoogleMaps(page: Page, query: string, maxResults = 20): Promise<Lead[]> {
  const results: Lead[] = [];
  const searchQuery = encodeURIComponent(query);

  console.log(`Navigating to search: ${query}...`);
  await page.goto(`https://www.google.com/maps/search/${searchQuery}`, { waitUntil: 'domcontentloaded' });

  const feed = page.locator('div[role="feed"]');
  await feed.waitFor({ state: 'visible', timeout: 15000 });

  // Scroll to load lazy elements
  for (let i = 0; i < 5; i++) {
    await feed.evaluate((el) => el.scrollBy(0, 1000));
    await page.waitForTimeout(1500); // Only acceptable here due to lazy-loading DOM
  }

  const listingUrls = await feed
    .locator('a[href*="/maps/place/"]')
    .evaluateAll((links) => [...new Set(links.map((link) => (link as HTMLAnchorElement).href))]);

  console.log(`Found ${listingUrls.length} links. Scraping top ${maxResults}...`);

  for (const listingUrl of listingUrls.slice(0, maxResults)) {
    try {
      await page.goto(listingUrl, { waitUntil: 'domcontentloaded' });

      const getText = async (selector: string): Promise<string> => {
        try {
          const locator = page.locator(selector).first();
          await locator.waitFor({ state: 'attached', timeout: 3000 });
          return await locator.innerText();
        } catch {
          return 'N/A';
        }
      };

      const name = await getText('h1.DUwDvf');
      if (name === 'N/A') continue;

      const ratingStr = await getText('div.F7nice span[aria-hidden="true"]');
      const reviews = await getText('div.F7nice span[aria-label]');
      const address = await getText('button[data-item-id="address"] div.Io6YTe');
      const phone = await getText('button[data-item-id*="phone"] div.Io6YTe');
      const category = await getText('button.DkEaL');

      let website = 'N/A';
      try {
        const webLocator = page.locator('a[data-item-id="authority"]').first();
        website = (await webLocator.getAttribute('href', { timeout: 2000 })) || 'N/A';
      } catch { /* Ignore */ }

      console.log(`Enriching: ${name}`);
      const enrichmentData = await enrichWebsiteData(page, website);

     results.push({
        fullName: name,
        rating: ratingStr !== 'N/A' ? parseFloat(ratingStr) : null,
        reviews: reviews !== 'N/A' ? reviews : null,
        address: address !== 'N/A' ? address : null,
        phone: phone !== 'N/A' ? phone : null,
        category: category !== 'N/A' ? category : null,
        website: website !== 'N/A' ? website : null,
        gmbLink: listingUrl,
        emails: enrichmentData.emails,
        socials: enrichmentData.socials,
      });

      console.log(`✅ Extracted: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to process ${listingUrl}:`, error);
    }
  }

  return results;
}