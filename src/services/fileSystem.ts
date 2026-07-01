import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { Lead } from "../types/lead.types";

export function readLeads(filePath: string): Lead[] {
  if (!existsSync(filePath)) return [];
  try {
    const fileContent = readFileSync(filePath, "utf-8");
    if (fileContent.trim() === "") return [];

    const parsed = JSON.parse(fileContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to read or parse JSON at ${filePath}.`, error);
    return [];
  }
}

function isSameLead(a: Lead, b: Lead): boolean {
  // 1. Match by gmbLink if available on both
  if (a.gmbLink && b.gmbLink && a.gmbLink !== "N/A" && b.gmbLink !== "N/A") {
    if (a.gmbLink.trim() === b.gmbLink.trim()) return true;
  }

  // 2. Match by phone if available on both
  if (a.phone && b.phone && a.phone !== "N/A" && b.phone !== "N/A") {
    const cleanPhoneA = a.phone.replace(/[^0-9]/g, "");
    const cleanPhoneB = b.phone.replace(/[^0-9]/g, "");
    // Compare last 10 digits to handle prefix differences like 0 or +91
    if (
      cleanPhoneA.slice(-10) === cleanPhoneB.slice(-10) &&
      cleanPhoneA.length >= 10 &&
      cleanPhoneB.length >= 10
    ) {
      return true;
    }
  }

  // 3. Match by name + address if available on both
  if (
    a.fullName &&
    b.fullName &&
    a.address &&
    b.address &&
    a.address !== "N/A" &&
    b.address !== "N/A"
  ) {
    const cleanNameA = a.fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanNameB = b.fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanAddrA = a.address.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanAddrB = b.address.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanNameA === cleanNameB && cleanAddrA === cleanAddrB) {
      return true;
    }
  }

  return false;
}

export function writeLeads(filePath: string, newLeads: Lead[]): void {
  // 1. Ensure the target directory exists
  const targetDir = dirname(filePath);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // 2. Read existing data and merge with deduplication
  const existingData = readLeads(filePath);

  const uniqueNewLeads = newLeads.filter((newLead) => {
    const exists = existingData.some((existingLead) =>
      isSameLead(existingLead, newLead),
    );
    if (exists) {
      console.log(`[Scraper] Skipping duplicate lead: ${newLead.fullName}`);
    }
    return !exists;
  });

  const mergedData = [...existingData, ...uniqueNewLeads];

  // 3. Write to the newly guaranteed path
  writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
  console.log(
    `Total ${mergedData.length} results saved to ${filePath}. (Skipped ${newLeads.length - uniqueNewLeads.length} duplicates)`,
  );
}
