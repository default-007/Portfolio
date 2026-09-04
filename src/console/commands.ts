export const COLORS = {
  ember: '#E8A33D',
  muted: '#B8AAA0',
  go: '#8FB877',
  warn: '#C0603A',
} as const;

export type CommandResult =
  | { kind: 'say'; text: string; color: string }
  | { kind: 'route'; chapterId: string; label: string }
  | { kind: 'clear' }
  | { kind: 'toggleSound' }
  | { kind: 'openResume' }
  | { kind: 'noop' };

const ROUTES: Record<string, { chapterId: string; label: string }> = {
  'top': { chapterId: 'ch0', label: 'arrival' },
  'open 00': { chapterId: 'ch0', label: 'arrival' },
  'profile': { chapterId: 'ch1', label: 'flight profile' },
  'open 01': { chapterId: 'ch1', label: 'flight profile' },
  'open 02': { chapterId: 'ch2', label: 'cbc school management' },
  'cbc': { chapterId: 'ch2', label: 'cbc school management' },
  'open cbc': { chapterId: 'ch2', label: 'cbc school management' },
  'open 03': { chapterId: 'ch3', label: 'waterwatch' },
  'water': { chapterId: 'ch3', label: 'waterwatch' },
  'waterwatch': { chapterId: 'ch3', label: 'waterwatch' },
  'open 04': { chapterId: 'ch4', label: 'smart ticketing' },
  'ticketing': { chapterId: 'ch4', label: 'smart ticketing' },
  'tickets': { chapterId: 'ch4', label: 'smart ticketing' },
  'checklist': { chapterId: 'ch5', label: 'checklist & incident' },
  'open 05': { chapterId: 'ch5', label: 'checklist & incident' },
  'incident': { chapterId: 'ch5', label: 'checklist & incident' },
  'hire': { chapterId: 'ch6', label: 'clearance' },
  'contact': { chapterId: 'ch6', label: 'clearance' },
  'open 06': { chapterId: 'ch6', label: 'clearance' },
};

const SAYS: Record<string, { text: string; color: string }> = {
  help: {
    text: 'ls · profile · open 02|03|04 · checklist · incident · hire · resume · sound · clear',
    color: COLORS.ember,
  },
  ls: {
    text: '00 arrival / 01 profile / 02 cbc / 03 waterwatch / 04 ticketing / 05 checklist+incident / 06 clearance',
    color: COLORS.muted,
  },
  whoami: {
    text: 'brian otieno — full-stack engineer, nairobi. 5 yr logged. aviation before software.',
    color: COLORS.muted,
  },
  stats: {
    text: '8 erp deployments · 99.5% uptime · 244+ institutions · 90% inside 24h sla',
    color: COLORS.muted,
  },
};

export function parseCommand(raw: string): CommandResult {
  const cmd = (raw || '').trim().toLowerCase();
  if (!cmd) return { kind: 'noop' };

  if (cmd === '?') return { kind: 'say', ...SAYS.help };
  if (cmd in SAYS) return { kind: 'say', ...SAYS[cmd] };
  if (cmd in ROUTES) return { kind: 'route', ...ROUTES[cmd] };
  if (cmd === 'clear') return { kind: 'clear' };
  if (cmd === 'sound') return { kind: 'toggleSound' };
  if (cmd === 'resume') return { kind: 'openResume' };

  return { kind: 'say', text: `unknown command: ${cmd} — try help`, color: COLORS.warn };
}
