import type { District, Record, PerformanceMetric, Category } from './types';

export const districts: District[] = [
  { id: 1, name: 'Ganjam' },
  { id: 2, name: 'Cuttack' },
  { id: 3, name: 'Bhubaneswar' },
  { id: 4, name: 'Puri' },
  { id: 5, name: 'Sambalpur' },
  { id: 6, name: 'Rourkela' },
];

export const records: Record[] = [
  // Ganjam Data
  { id: 1, districtId: 1, category: 'NBW', value: 120, date: '2023-05-15' },
  { id: 2, districtId: 1, category: 'Conviction', value: 45, date: '2023-05-20' },
  { id: 3, districtId: 1, category: 'Narcotics', value: 18, date: '2023-05-10' },
  { id: 4, districtId: 1, category: 'Missing Person', value: 25, date: '2023-05-05' },
  { id: 17, districtId: 1, category: 'NBW', value: 110, date: '2023-04-15' },
  { id: 18, districtId: 1, category: 'Narcotics', value: 12, date: '2023-04-10' },

  // Cuttack Data
  { id: 5, districtId: 2, category: 'NBW', value: 110, date: '2023-05-15' },
  { id: 6, districtId: 2, category: 'Conviction', value: 55, date: '2023-05-20' },
  { id: 7, districtId: 2, category: 'Narcotics', value: 15, date: '2023-05-10' },
  { id: 8, districtId: 2, category: 'Missing Person', value: 22, date: '2023-05-05' },

  // Bhubaneswar Data
  { id: 9, districtId: 3, category: 'NBW', value: 130, date: '2023-05-15' },
  { id: 10, districtId: 3, category: 'Conviction', value: 50, date: '2023-05-20' },
  { id: 11, districtId: 3, category: 'Narcotics', value: 22, date: '2023-05-10' },
  { id: 12, districtId: 3, category: 'Missing Person', value: 30, date: '2023-05-05' },

  // Puri Data
  { id: 13, districtId: 4, category: 'NBW', value: 95, date: '2023-05-15' },
  { id: 14, districtId: 4, category: 'Conviction', value: 40, date: '2023-05-20' },
  { id: 15, districtId: 4, category: 'Narcotics', value: 10, date: '2023-05-10' },
  { id: 16, districtId: 4, category: 'Missing Person', value: 18, date: '2023-05-05' },
  
  // Sambalpur Data
  { id: 19, districtId: 5, category: 'NBW', value: 105, date: '2023-05-15' },
  { id: 20, districtId: 5, category: 'Conviction', value: 48, date: '2023-05-20' },

  // Rourkela Data
  { id: 21, districtId: 6, category: 'Narcotics', value: 19, date: '2023-05-10' },
  { id: 22, districtId: 6, category: 'Missing Person', value: 28, date: '2023-05-05' },
];

export const kpiData: PerformanceMetric[] = [
    { category: 'NBW', label: 'NBW Execution', value: 560, change: 12.5 },
    { category: 'Conviction', label: 'Conviction Ratio', value: 198, change: -2.1 },
    { category: 'Narcotics', label: 'Narcotic Seizures', value: 84, change: 15.3 },
    { category: 'Missing Person', label: 'Missing Persons Traced', value: 123, change: 5.8 },
];

export const categoryLabels: Record<Category, string> = {
    'NBW': 'NBW Execution',
    'Conviction': 'Conviction Ratio',
    'Narcotics': 'Narcotic Seizures',
    'Missing Person': 'Missing Persons Traced',
};

export const trendData = [
  { month: 'Jan', NBW: 400, Conviction: 240, Narcotics: 50, 'Missing Person': 80 },
  { month: 'Feb', NBW: 300, Conviction: 139, Narcotics: 45, 'Missing Person': 90 },
  { month: 'Mar', NBW: 200, Conviction: 180, Narcotics: 60, 'Missing Person': 100 },
  { month: 'Apr', NBW: 278, Conviction: 190, Narcotics: 55, 'Missing Person': 110 },
  { month: 'May', NBW: 189, Conviction: 200, Narcotics: 70, 'Missing Person': 120 },
  { month: 'Jun', NBW: 239, Conviction: 210, Narcotics: 80, 'Missing Person': 130 },
];

export const districtPerformance = districts.map(district => {
  const districtRecords = records.filter(r => r.districtId === district.id && r.date.startsWith('2023-05'));
  return {
    name: district.name,
    NBW: districtRecords.find(r => r.category === 'NBW')?.value ?? 0,
    Conviction: districtRecords.find(r => r.category === 'Conviction')?.value ?? 0,
    Narcotics: districtRecords.find(r => r.category === 'Narcotics')?.value ?? 0,
    'Missing Person': districtRecords.find(r => r.category === 'Missing Person')?.value ?? 0,
  }
});
