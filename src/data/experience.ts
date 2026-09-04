export type Leg = {
  company: string;
  role: string;
  detail: string;
  sector: string;
  startCol: number;
  span: number;
  gradient: [string, string];
};

export const LEGS: readonly Leg[] = [
  {
    company: 'Lloyd Constellations',
    role: 'Software Engineer',
    detail: 'ODOO 18 · 6 MODULES · 5 SERVERS',
    sector: 'ERP',
    startCol: 8, span: 2,
    gradient: ['#C0603A', '#E8A33D'],
  },
  {
    company: 'Integrated Spatial',
    role: 'GIS Developer & Data Eng.',
    detail: 'POSTGIS · 60+ MAPS · 4 APPS',
    sector: 'GIS',
    startCol: 6, span: 2,
    gradient: ['#3F6F5A', '#8FB877'],
  },
  {
    company: 'Bakpage Labs',
    role: 'Full-Stack Developer',
    detail: 'DJANGO + REACT · M-PESA',
    sector: 'Product',
    startCol: 4, span: 2,
    gradient: ['#4A5C7A', '#8A9FB8'],
  },
  {
    company: 'Eclectics International',
    role: 'Frontend Engineer Intern',
    detail: '244+ INSTITUTIONS',
    sector: 'Fintech',
    startCol: 3, span: 1,
    gradient: ['#5B4A6E', '#9A86B5'],
  },
  {
    company: 'Kenya Civil Aviation',
    role: 'Flight Operations Intern',
    detail: 'AOC FILES · MANUAL REVIEW',
    sector: 'Aviation',
    startCol: 1, span: 2,
    gradient: ['#6E6058', '#B8AAA0'],
  },
] as const;

export type Stat = { value: number; decimals?: number; suffix?: string; label: string };

export const STATS: readonly Stat[] = [
  { value: 8, label: 'ERP DEPLOYMENTS\nFLOWN END-TO-END' },
  { value: 99.5, decimals: 1, suffix: '%', label: 'UPTIME · 5 PRODUCTION\nSERVERS · 8 MONTHS' },
  { value: 244, suffix: '+', label: 'INSTITUTIONS REACHED\nBY SHIPPED UI' },
  { value: 90, suffix: '%', label: 'TICKETS CLOSED INSIDE\nA 24-HOUR SLA' },
] as const;
