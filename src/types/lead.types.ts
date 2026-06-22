export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface Lead {
  // Matched to Mongoose Schema
  fullName: string; 
  phone?: string | null;
  emails?: string[];
  address?: string | null;
  category?: string | null;
  alternatePhone?: string | null;
  
  rating?: number | null;
  reviews?: string | null; // Note: Not in Mongoose, handled in 'notes' during import
  
  website?: string | null;
  gmbLink?: string | null;
  socials?: SocialLinks;
}