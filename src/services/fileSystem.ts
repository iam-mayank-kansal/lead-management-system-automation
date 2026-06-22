import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { Lead } from '../types/lead.types';

export function readLeads(filePath: string): Lead[] {
  if (!existsSync(filePath)) return [];
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    if (fileContent.trim() === '') return [];
    
    const parsed = JSON.parse(fileContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to read or parse JSON at ${filePath}.`, error);
    return [];
  }
}

export function writeLeads(filePath: string, newLeads: Lead[]): void {
  // 1. Ensure the target directory exists
  const targetDir = dirname(filePath);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // 2. Read existing data and merge
  const existingData = readLeads(filePath);
  const mergedData = [...existingData, ...newLeads];
  
  // 3. Write to the newly guaranteed path
  writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
  console.log(`Total ${mergedData.length} results saved to ${filePath}.`);
}