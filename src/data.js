/* Everything the site says lives in this file. To add something, add an entry to the right list:
   the page lays itself out from these lists, nothing else needs to change. */

export const IDENTITY = {
  name: 'Rayan Sama',
  unit: 'RS—01',
  aliases: ['etyb0c4', 'saiyanj1n'], // handles I may be known under
  role: 'Full-stack developer & security researcher',
  line: 'I take black boxes apart, then I build better ones.',
  base: 'Cotonou, Bénin',
  school: 'Epitech · class of 2029',
  status: 'Open to internships',
  avatar: 'avatar.jpg',
}

export const LINKS = [
  { label: 'Mail', text: 'ryansama.tech@gmail.com', url: 'mailto:ryansama.tech@gmail.com' },
  { label: 'GitHub', text: 'etyb0c4', url: 'https://github.com/etyb0c4' },
  { label: 'LinkedIn', text: 'rayan-sama', url: 'https://linkedin.com/in/rayan-sama' },
]

/* Results, rankings, certifications. Newest first.
   rank: what is printed big on the left ('02', 'TOP 5', '★'…)   as: the handle used   url: optional write-up or scoreboard */
export const RECORD = [
  {
    rank: '02', result: '2nd place', event: 'HackerLab 2026', scope: 'Finale · team', kind: 'CTF',
    date: '2026-11', as: 'saiyanj1n', tags: ['web', 'pwn', 'rev', 'forensics'], url: '',
  },
]

export const PROJECTS = [
  {
    id: 'b2r-kit', name: 'b2r-kit', role: 'Boot2root accelerator', year: '2026', side: 'break',
    blurb: 'A CLI that kills the two time-sinks when an LLM agent solves a machine: round-trip recon and verbose tool output eating context. One command scans, enumerates every service in parallel, and writes a state file the agent reads.',
    stack: ['Bash', 'nmap', 'ffuf', 'netexec', 'impacket'], metric: '1 command → full recon', img: 'proj/b2r-kit.jpg', url: '',
  },
  {
    id: 'chess3d', name: 'chess3d', role: 'Three.js chess engine', year: '2025', side: 'build',
    blurb: 'A full 3D chess game in the browser: legal-move validation with castling, promotion and en passant, a minimax + alpha-beta AI, and a cinematic render pipeline with bloom, afterimage trails and an orbit camera.',
    stack: ['Three.js', 'EffectComposer', 'minimax', 'WebGL'], metric: 'minimax depth 3 · bloom', img: 'proj/chess3d.jpg', url: '',
  },
  {
    id: 'jarvis-hud', name: 'Jarvis HUD', role: 'Reactive interface', year: '2026', side: 'build',
    blurb: 'A voice-assistant HUD built on React-Three-Fiber and drei: a reactive core that breathes with audio input, wrapped in framer-motion transitions. An experiment in making an interface feel alive.',
    stack: ['React', 'R3F', 'drei', 'framer-motion'], metric: 'audio-reactive core', img: 'proj/jarvis-hud.jpg', url: '',
  },
  {
    id: 'ctf', name: 'CTF field notes', role: 'HackTheBox · Root-Me', year: 'ongoing', side: 'break',
    blurb: 'Machines rooted and flags captured across HackTheBox and Root-Me: web exploitation, binary pwn, reverse engineering, forensics. Every solve becomes a reusable playbook in the arsenal.',
    stack: ['pwntools', 'Ghidra', 'Burp', 'sqlmap'], metric: 'every solve → a playbook', img: 'proj/ctf.jpg', url: '',
  },
]

/* What comes out of the box once it is taken apart: one part per discipline.
   The ids are wired to the four modules inside the 3D box; tools are free to change. */
export const PARTS = [
  { id: 'web', key: 'A', title: 'Web exploitation', tools: ['Burp Suite', 'sqlmap', 'ZAP', 'ffuf'] },
  { id: 'pwn', key: 'B', title: 'Binary exploitation', tools: ['pwntools', 'GDB', 'Metasploit'] },
  { id: 'rev', key: 'C', title: 'Reverse engineering', tools: ['Ghidra', 'jadx'] },
  { id: 'forensics', key: 'D', title: 'Forensics', tools: ['Volatility', 'binwalk', 'Wireshark'] },
]

export const PORTS = [
  { id: 'p0', title: '22/tcp', note: 'ssh · open' },
  { id: 'p1', title: '80/tcp', note: 'http · open' },
  { id: 'p2', title: '443/tcp', note: 'https · open' },
]

export const STACK = ['C', 'Python', 'JavaScript', 'Rust', 'React', 'Three.js', 'Vite', 'Docker', 'Linux', 'Git']

/* Write-ups, research, CVEs, reviews of events. The section stays hidden while this list is empty.
   { title, date: '2026-11', category: 'CTF review' | 'Research' | 'CVE' | …, summary, tags: [], url } */
export const NOTES = []

export const FLAGS = {
  box: 'FLAG{th3r3_1s_4lw4ys_4_w4y_1n}',
  console: 'FLAG{d3vt00ls_1s_r3c0n}',
}
