import type { District, Category } from './types';

export const districts: District[] = [
  { id: 1, name: 'Ganjam' },
  { id: 2, name: 'Cuttack' },
  { id: 3, name: 'Bhubaneswar' },
  { id: 4, name: 'Puri' },
  { id: 5, name: 'Sambalpur' },
  { id: 6, name: 'Rourkela' },
];

export const categoryLabels: Record<Category, string> = {
  'Cases Registered': 'Cases Registered',
  'Cases Solved': 'Cases Solved',
  'Total Convictions': 'Total Convictions',
  'Heinous Crime Cases': 'Heinous Crime Cases',
  'Property Crime Cases': 'Property Crime Cases',
  'NBW': 'NBW Execution',
  'Conviction': 'Conviction Ratio',
  'Narcotics': 'Narcotic Seizures',
  'Missing Person': 'Missing Persons Traced',
  'Firearms': 'Firearms Seized',
  'Sand Mining': 'Illegal Sand Mining Cases',
  'Preventive Actions': 'Preventive Actions Taken',
  'Important Detections': 'Important Detections',
  'Crime Against Women': 'Crime Against Women',
  'Cybercrime': 'Cybercrime',
  'Road Accidents': 'Road Accidents',
  'Others': 'Others',
};
