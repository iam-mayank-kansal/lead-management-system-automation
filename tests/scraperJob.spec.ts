import { test } from "@playwright/test";
import { scrapeGoogleMaps } from "../src/services/scraperService";
import { writeLeads } from "../src/services/fileSystem";

test("Scrape Google Maps to JSON", async ({ page }) => {
  test.setTimeout(30 * 60 * 1000);

  const queries = [
    "Library in Pitampura",
    "Co-working space in Pitampura",
    "Study room in Pitampura",
  ];

  const maxResults = process.env.MAX_RESULTS
    ? parseInt(process.env.MAX_RESULTS)
    : 2;
  const filePath = "./output/gmblead.json";

  console.log(
    `Starting bulk batch scrape for ${queries.length} target queries...`,
  );

  for (const query of queries) {
    try {
      console.log(`\n🚀 Executing Scrape Loop for: "${query}"`);
      const scrapedLeads = await scrapeGoogleMaps(page, query, maxResults);
      if (scrapedLeads.length === 0) {
        console.warn(
          `⚠️ Query "${query}" yielded 0 results. Skipping file save.`,
        );
        continue;
      }

      writeLeads(filePath, scrapedLeads);

      console.log(`✅ Appended results for: "${query}"`);
    } catch (error) {
      console.error(`❌ Crashing error during query "${query}":`, error);
    }
  }

  console.log(`\n🎉 Bulk Scrape Job Complete. Pipeline execution ended.`);
});
