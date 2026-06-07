export interface Cycle {
  id: number;
  cycle_id: string;
  name: string;
  description?: string;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
  _count?: CycleCount;
}

export interface CycleCount {
  gradeLevels: number;
}

export interface CycleStatistics {
  totalCycles: number;
  activeCycles: number;
  cyclesWithGrades: number;
}
