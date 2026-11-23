/* Everything the site says lives in this file. To add something, add an entry to the right list:
   the page lays itself out from these lists, nothing else needs to change. */

export const IDENTITY = {
  name: 'Rayan Sama',
  unit: 'RS—01',
  aliases: ['etyb0c4', 'saiyanj1n'], // handles I may be known under
  role: 'Full-stack developer & security researcher',
  line: 'I take black boxes apart, then I build better ones.',
  base: 'Cotonou, Bénin',
  school: 'Epitech · class of 2030',
  status: 'Open to experience',
  avatar: 'avatar.jpg',
}

export const LINKS = [
  { label: 'Mail', text: 'ryansama.tech@gmail.com', url: 'mailto:ryansama.tech@gmail.com' },
  { label: 'GitHub', text: 'etyb0c4', url: 'https://github.com/etyb0c4' },
  { label: 'LinkedIn', text: 'rayan-sama', url: 'https://linkedin.com/in/rayan-sama' },
  { label: 'HackTheBox', text: 'profile', url: 'https://app.hackthebox.com/users/3097294' },
  { label: 'CV', text: 'Download (PDF)', url: 'cv/rayan-sama-cv.pdf', download: 'rayan-sama-cv.pdf' },
]

/* Where I have worked. Newest first.   only: 'build' | 'break' shows the entry in one dimension only */
export const EXPERIENCE = [
  {
    org: 'ISOCEL Telecom', logo: 'logos/isocel.png', full: "ISOCEL Telecom · Ici C'est La Fibre", role: 'SysAdmin, Security & Software Development assistant',
    kind: 'Internship', place: 'Cotonou, Bénin · on-site', from: '2026-08', to: '2026-11', length: '4', unit: 'mo',
    points: [
      'Co-built a data-center access control system with the team: access requests and approvals, single-use door codes, a chained audit log, and a Python entry terminal that talks to its REST API, covered by automated tests.',
      'Ran vulnerability assessments on web apps and systems (OWASP): found CSRF and SQL injection, documented each with remediation steps.',
      'Configured and maintained Linux servers, handled Windows system updates.',
      'Wrote Python and Bash scripts to automate routine system tasks and operational workflows.',
      'Diagnosed and upgraded hardware: disks, RAM, internal components.',
    ],
    stack: ['Linux', 'Windows', 'Python', 'Bash', 'Symfony', 'PostgreSQL', 'REST API', 'OWASP'],
  },
  {
    org: 'Epihack', logo: 'logos/epihack.png', full: 'Epihack · Epitech Bénin', role: "Administration team member, Epitech Bénin's cybersecurity association",
    kind: 'Association', place: 'Epitech Bénin · Cotonou', length: 'ADM', unit: '', only: 'break',
    points: [],
    stack: ['CTF', 'cybersecurity'],
  },
  {
    org: 'BDE Epitech Bénin', logo: 'logos/bde.png', full: 'BDE · Epitech Bénin', role: 'Sports team member, also working with the events and tech teams',
    kind: 'Student union', place: 'Epitech Bénin · Cotonou', length: 'BDE', unit: '', only: 'build',
    points: [],
    stack: ['sports', 'events', 'tech'],
  },
]

/* Certificates. Newest first.   id: credential id   url: optional public verification link */
export const CERTS = [
  {
    title: 'AI Fluency: Framework & Foundations', issuer: 'Anthropic', mark: 'A', logo: 'logos/anthropic.png', date: '2026-10',
    id: 'k8bjpfwwyta4', skills: ['Critical thinking', 'Prompt engineering', 'Delegation', 'Discernment'], url: 'https://verify.skilljar.com/c/k8bjpfwwyta4',
  },
  {
    title: "CS50's Introduction to Programming with Python", issuer: 'HarvardX · CS50', mark: 'H', logo: 'logos/harvard.png', date: '2026-10',
    id: '18a60afa-04c1-412c-b272-41791f9fe175', skills: ['Python', 'pytest', 'unit testing'],
    url: 'https://certificates.cs50.io/18a60afa-04c1-412c-b272-41791f9fe175.pdf',
  },
]

/* Results and rankings. Newest first.   points: optional details listed under the event
   rank: what is printed big on the left ('02', 'TOP 5', '★'…)   badge: optional emoji next to it ('🥈'…)   as: the handle used   url: optional write-up or scoreboard */
export const RECORD = [
  {
    rank: '02', badge: '🥈', result: '2nd place', event: 'HackerLab Bénin 2026', scope: 'Finale · team SAIYANS · 48 h on-site', kind: 'CTF',
    date: '2026-11', as: 'saiyanj1n', url: '',
    points: [
      'Attack and defense, not only jeopardy: King of the Hill (root a box, then hold it against three other teams) and a 1-vs-1 Death Match (break the rival machine while patching your own, flags rotating every 10 minutes).',
      'DFIR speedrun on an ELK stack: rebuild a full incident against the clock.',
      'Whitebox code audit in front of the jury: find the vulnerability, then defend the patch.',
      'Jeopardy across forensics, crypto, blockchain tracing, web3, Active Directory, web, OSINT and ICS.',
    ],
    tags: ['attack-defense', 'DFIR', 'forensics', 'crypto', 'blockchain', 'AD', 'web', 'OSINT'],
  },
]

export const PROJECTS = [
  {
    id: 'b2r-kit', name: 'b2r-kit', role: 'Boot2root accelerator', year: '2026', side: 'break',
    blurb: 'A CLI that kills the two time-sinks when an LLM agent solves a machine: round-trip recon and verbose tool output eating context. One command scans, enumerates every service in parallel, and writes a state file the agent reads.',
    stack: ['Bash', 'nmap', 'ffuf', 'netexec', 'impacket'], metric: '1 command → full recon', img: 'proj/b2r-kit.jpg', url: '',
  },
  {
    id: 'corewar', name: 'Corewar', role: 'Virtual machine in C', year: '2026', side: 'build',
    blurb: 'A virtual machine where compiled champions fight for a shared, circular 4 KB memory arena. Every process runs on its own registers, program counter and carry; the VM schedules them cycle by cycle, kills the silent ones, and crowns the last to call live. Ships with a live ncurses view of the arena.',
    stack: ['C', 'ncurses', 'assembly', 'Makefile'], metric: '4 KB arena · 16 opcodes', img: 'proj/corewar.jpg', url: '',
  },
  {
    id: 'dc-access', name: 'DC Access', role: 'Data-center access control', year: '2026', side: 'build',
    blurb: 'Built with the team during my ISOCEL Telecom internship: the system that decides who gets through a data-center door. Access requests go through approval, each visitor gets a single-use, time-boxed code, and every event lands in a chained audit log. The entry terminal is a Python service that fails closed: no network or a rejected token, and the door stays shut.',
    stack: ['Symfony', 'PostgreSQL', 'Python', 'REST API', 'pytest', 'Docker'], metric: 'single-use codes · fails closed', img: 'proj/dc-access.jpg', url: '',
  },
  {
    id: 'logdog', name: 'LogDog', role: 'Log forensics CLI', year: '2026', side: 'break',
    blurb: 'Incident response on a Linux box: LogDog ranks every IP that touched it, flags which ones actually got in (account, auth method, timestamp) and reads wtmp to surface active sessions. Pure Python standard library, so it runs on any server you land on.',
    stack: ['Python', 'regex', 'auth.log', 'wtmp'], metric: '0 dependencies', img: 'proj/logdog.jpg', url: 'https://github.com/etyb0c4/LogDog',
  },
]

/* The arsenal: one part per discipline, tools are free to change. */
export const PARTS = [
  { id: 'osint', key: 'A', title: 'OSINT & recon', tools: ['Maltego', 'SpiderFoot', 'Shodan'] },
  { id: 'web', key: 'B', title: 'Web exploitation', tools: ['Burp Suite', 'sqlmap', 'ZAP', 'ffuf'] },
  { id: 'pwn', key: 'C', title: 'Binary exploitation', tools: ['pwntools', 'GDB', 'Metasploit'] },
  { id: 'rev', key: 'D', title: 'Reverse engineering', tools: ['Ghidra', 'jadx'] },
  { id: 'forensics', key: 'E', title: 'Forensics', tools: ['Volatility', 'binwalk', 'Wireshark'] },
]

export const PORTS = [
  { id: 'p0', title: '22/tcp', note: 'ssh · open' },
  { id: 'p1', title: '80/tcp', note: 'http · open' },
  { id: 'p2', title: '443/tcp', note: 'https · open' },
]

export const STACK = ['C', 'Python', 'JavaScript', 'Rust', 'React', 'Three.js', 'Vite', 'Docker', 'Linux', 'Git', 'GitHub']

/* Write-ups, research, CVEs, reviews of events. The section stays hidden while this list is empty.
   { title, date: '2026-11', category: 'CTF review' | 'Research' | 'CVE' | …, summary, tags: [], url } */
export const NOTES = []

export const FLAGS = {
  box: 'FLAG{th3r3_1s_4lw4ys_4_w4y_1n}',
  console: 'FLAG{d3vt00ls_1s_r3c0n}',
}

/* what the shattering leaves behind: one shard per discipline (drawn as canvas labels) */
export const SHARD_LABELS = [
  { sw: 'O', a: 'SINT', b: 'recon', c: 'Maltego · SpiderFoot · Shodan' },
  { sw: 'W', a: 'eb', b: 'exploitation', c: 'Burp Suite · sqlmap · ZAP' },
  { sw: 'B', a: 'inary', b: 'pwn', c: 'pwntools · GDB · Metasploit' },
  { sw: 'R', a: 'everse', b: 'engineering', c: 'Ghidra · jadx' },
  { sw: 'F', a: 'orensics', b: '', c: 'Volatility · binwalk · Wireshark' },
]
