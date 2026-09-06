export type ContactRow = { label: string; value: string; href: string };

// The DOCUMENT row's href intentionally departs from the design source.
// The design's literal anchor target, "./Brian%20Otieno%20Resume.dc.html",
// only resolves inside the Claude Design canvas host and would 404 on the
// deployed static site. Task 18 creates public/resume.html, and task 2's
// openResume console command already opens "./resume.html" — this href
// must keep matching that same file. Do not "fix" this back to the design's
// path when diffing against the design source; link targets are build
// artifacts, not copy, and are exempt from the verbatim-transcription rule.
export const CONTACT: readonly ContactRow[] = [
  { label: 'EMAIL', value: 'brianokola@gmail.com', href: 'mailto:brianokola@gmail.com' },
  { label: 'GITHUB', value: 'default-007', href: 'https://github.com/default-007' },
  { label: 'LINKEDIN', value: 'brian-otieno', href: 'https://linkedin.com/in/brian-otieno' },
  { label: 'PHONE', value: '+254 708 681091', href: 'tel:+254708681091' },
  { label: 'DOCUMENT', value: 'Résumé →', href: './resume.html' },
] as const;

export const EDUCATION: readonly string[] = [
  'MSc Computing & Information Systems — Strathmore (in progress)',
  'Data Science & ML — MIT',
  'Software Development — Moringa',
  'BSc Civil Aviation — Moi',
] as const;

export const CERTIFICATIONS: readonly string[] = [
  'AWS Cloud Practitioner',
  'Cisco CCNA (in progress)',
] as const;
