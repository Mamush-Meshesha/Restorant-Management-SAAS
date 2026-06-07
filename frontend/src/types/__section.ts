export interface Section {
  section_id: string;
  name: string;
  description?: string;
  section_code?: string;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string

  _count?: SectionCount;
}

export interface SectionCount {
  students: number;
}

export interface CreateSectionData {
  name: string;
  description?: string;
  section_code?: string;
}

export interface UpdateSectionData {
  name?: string;
  description?: string;
  section_code?: string;
}

export interface SectionStatistics {
  totalSections: number;
  activeSections: number;
  sectionsWithStudents: number;
}
