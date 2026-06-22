import { Page } from '@playwright/test';
import { SocialLinks } from '../types/lead.types';

export interface EnrichmentResult {
  emails: string[];
  socials: SocialLinks;
}

export async function enrichWebsiteData(page: Page, website: string | null): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    emails: [],
    socials: { facebook: 'N/A', instagram: 'N/A', linkedin: 'N/A', twitter: 'N/A', youtube: 'N/A', whatsapp: 'N/A' },
  };

  if (!website || website === 'N/A') return result;

  const baseWebsite = website.replace(/\/$/, '');
  const pagesToCheck = [baseWebsite, `${baseWebsite}/contact`, `${baseWebsite}/about`];

  const emails = new Set<string>();
  const socialSet = { facebook: new Set<string>(), instagram: new Set<string>(), linkedin: new Set<string>(), twitter: new Set<string>(), youtube: new Set<string>(), whatsapp: new Set<string>() };

  for (const url of pagesToCheck) {
    let tempPage: Page | null = null;
    try {
      tempPage = await page.context().newPage();
      await tempPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await tempPage.waitForTimeout(1000);

      const html = await tempPage.content();
      const foundEmails = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
      foundEmails.forEach((email) => emails.add(email.toLowerCase()));

      const links = await tempPage.locator('a').evaluateAll((anchors) =>
        anchors.map((a) => (a as HTMLAnchorElement).href).filter(Boolean)
      );

      for (const link of links) {
        const href = link.toLowerCase();
        if (href.includes('facebook.com')) socialSet.facebook.add(link);
        if (href.includes('instagram.com')) socialSet.instagram.add(link);
        if (href.includes('linkedin.com')) socialSet.linkedin.add(link);
        if (href.includes('twitter.com') || href.includes('x.com')) socialSet.twitter.add(link);
        if (href.includes('youtube.com') || href.includes('youtu.be')) socialSet.youtube.add(link);
        if (href.includes('wa.me') || href.includes('whatsapp.com')) socialSet.whatsapp.add(link);
      }
    } catch {
      // Gracefully skip failed navigations
    } finally {
      if (tempPage) await tempPage.close();
    }
  }

  result.emails = [...emails];
  result.socials = {
    facebook: [...socialSet.facebook][0] || 'N/A',
    instagram: [...socialSet.instagram][0] || 'N/A',
    linkedin: [...socialSet.linkedin][0] || 'N/A',
    twitter: [...socialSet.twitter][0] || 'N/A',
    youtube: [...socialSet.youtube][0] || 'N/A',
    whatsapp: [...socialSet.whatsapp][0] || 'N/A',
  };

  return result;
}