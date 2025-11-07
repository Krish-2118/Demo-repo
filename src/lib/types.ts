export type District = {
  id: number;
  name: string;
};

export type Category = 'NBW' | 'Conviction' | 'Narcotics' | 'Missing Person';

export type Record = {
  id: string; // Changed to string to match firestore doc id
  districtId: number;
  category: Category;
  value: number;
  date: any; // Can be ISO String or Firestore Timestamp
};

export type PerformanceMetric = {
  category: Category;
  label: string;
  value: number;
  change: number;
};
