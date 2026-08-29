export interface StackGroup {
  label: string;
  items: string[];
}

export interface ChipGroup {
  title: string;
  chips: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  /** Empty for CKA — the issue date could not be located, do not invent one. */
  date: string;
}

export interface LanguageEntry {
  name: string;
  level: string;
}
