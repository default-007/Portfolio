export type ContactRow = { label: string; value: string; href: string };

export const CONTACT: readonly ContactRow[] = [
  { label: 'EMAIL', value: 'brianokola@gmail.com', href: 'mailto:brianokola@gmail.com' },
  { label: 'GITHUB', value: 'default-007', href: 'https://github.com/default-007' },
  { label: 'LINKEDIN', value: 'brian-otieno', href: 'https://linkedin.com/in/brian-otieno' },
  { label: 'PHONE', value: '+254 708 681091', href: 'tel:+254708681091' },
  { label: 'DOCUMENT', value: 'Résumé →', href: './Brian%20Otieno%20Resume.dc.html' },
] as const;

export const EDUCATION: readonly string[] = [
  'MSc Computing & Information Systems — Strathmore (in progress)',
  'Data Science & ML — MIT',
  'Software Development — Moringa',
  'BSc Civil Aviation — Moi',
] as const;

export const CERTIFICATIONS: readonly string[] = [
  'AWS Cloud Practitioner',
  'Cisco Junior Cyber Security Analyst (in progress)',
] as const;
