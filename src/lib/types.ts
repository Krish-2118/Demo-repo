export type District = {
  id: number;
  name: string;
};

export type Category = 'NBW' | 'Conviction' | 'Narcotics' | 'Missing Person';

export type Record = {
  id: number;
  districtId: number;
  category: Category;
  value: number;
  date: string; // YYYY-MM-DD
};

export type PerformanceMetric = {
  category: Category;
  label: string;
  value: number;
  change: number;
};
