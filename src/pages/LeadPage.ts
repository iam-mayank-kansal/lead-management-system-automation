import { Page } from "@playwright/test";
import { Lead } from "../types/lead.types";

export class LeadPage {
  constructor(private readonly page: Page) {}

  async navigateToAddLead() {
    await this.page.goto("/leads/add");
    // Wait for a definitive element on the page to guarantee rendering
    await this.page.waitForSelector("text=PERSONAL INFORMATION", {
      state: "visible",
    });
  }

  async fillPersonalInformation(lead: Lead) {
    // Using IDs assuming your frontend developer named them according to the Mongoose schema.
    await this.page.locator("#fullName").fill(lead.fullName || "Unknown Lead");

    if (lead.phone) {
      await this.page.locator("#phone").fill(lead.phone.replace(/\D/g, ""));
    }

    if (lead.emails && lead.emails.length > 0) {
      // The UI says "Emails (Comma separated)"
      await this.page.locator("#emails").fill(lead.emails.join(", "));
    }

    if (lead.address) {
      await this.page.locator("#address").fill(lead.address);
    }

    if (lead.category) {
      await this.page.locator("#category").fill(lead.category);
    }

    if (lead.rating) {
      await this.page.locator("#rating").fill(lead.rating.toString());
    }
  }

  async fillDirectoryAndSocials(lead: Lead) {
    // Mapping to the "DIRECTORY & SOCIAL LINKS" section in your UI
    if (lead.website) {
      await this.page.locator("#website").fill(lead.website);
    }

    if (lead.gmbLink) {
      await this.page.locator("#gmbLink").fill(lead.gmbLink);
    }

    if (lead.socials) {
      if (lead.socials.facebook && lead.socials.facebook !== "N/A") {
        await this.page.locator("#facebook").fill(lead.socials.facebook);
      }
      if (lead.socials.instagram && lead.socials.instagram !== "N/A") {
        await this.page.locator("#instagram").fill(lead.socials.instagram);
      }
      if (lead.socials.linkedin && lead.socials.linkedin !== "N/A") {
        await this.page.locator("#linkedin").fill(lead.socials.linkedin);
      }
      if (lead.socials.youtube && lead.socials.youtube !== "N/A") {
        await this.page.locator("#youtube").fill(lead.socials.youtube);
      }
    }
  }

  async selectDropdownOption(dropdownId: string, optionName: string) {
    // Note: If your custom UI dropdowns do not have these exact IDs on the trigger button, this will fail.
    await this.page.locator(`#${dropdownId}`).click();
    await this.page.getByRole("option", { name: optionName }).click();
    await this.page.keyboard.press("Escape");
  }

  async fillLeadInformation(lead : Lead) {
    // Only filling the required ones marked with * in your UI
    await this.selectDropdownOption("source", "Google Maps");

    const statusLocator = this.page.locator("#status");
    await statusLocator.scrollIntoViewIfNeeded();
    if ((lead.phone && lead.phone.trim() !== "") || (lead.emails && lead.emails.length > 0)) {
      await this.selectDropdownOption("status", "New");
    }
    else
    {
      await this.selectDropdownOption("status", "Unqualified");
    }
  }

  async fillFollowUpInformation() {
    await this.selectDropdownOption("priority", "Low");
    await this.selectDropdownOption("contactMethod", "WhatsApp");
  }

  async fillAdditionalInformation(lead: Lead) {
    // Now that dedicated fields exist for links, only put actual unstructured notes here.
    const requirementsLocator = this.page.locator("#requirements");
    await requirementsLocator.scrollIntoViewIfNeeded();
    await requirementsLocator.fill(
      `Lead automatically scraped from Google Maps.`,
    );

    if (lead.reviews) {
      await this.page.locator("#notes").fill(`Review Data: ${lead.reviews}`);
    }
  }

  async submitLead() {
    // FIX: Targeting the actual text of the button from your screenshot, not a hidden ID.
    const btn = this.page.getByRole("button", { name: "Add Lead" });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();

    // Explicit wait for backend resolution to prevent cascade pipeline failures
    await this.page.waitForTimeout(2000);
  }

  async createLead(lead: Lead) {
    await this.navigateToAddLead();
    await this.fillPersonalInformation(lead);
    await this.fillDirectoryAndSocials(lead);
    await this.fillLeadInformation(lead);
    await this.fillFollowUpInformation();
    await this.fillAdditionalInformation(lead);
    await this.submitLead();
  }
}
