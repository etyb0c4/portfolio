export const NEOFETCH = [
  ['OS', 'Arch Linux x86_64'],
  ['host', 'etyb0c4.core'],
  ['kernel', '6.x-hardened'],
  ['wm', 'Hyprland · Wayland'],
  ['shell', 'zsh + tmux'],
  ['editor', 'nvim'],
  ['role', 'full-stack // security'],
  ['school', 'Epitech Benin · 29'],
  ['ctf', 'HackTheBox · Root-Me'],
  ['uptime', '∞'],
]

export const ASCII = String.raw`
   ▄████▄  ▄▄▄
  ▒██▀ ▀█ ▒████▄
  ▒▓█    ▄▒██  ▀█▄
  ▒▓▓▄ ▄██░██▄▄▄▄██
  ▒ ▓███▀ ░▓█   ▓██▒
`

// skills rendered as a live process table
export const PROCS = [
  { pid: 1337, cpu: 98.2, mem: 12.4, cmd: 'python3 exploit.py' },
  { pid: 42,   cpu: 74.0, mem: 22.1, cmd: 'gcc -O2 core.c' },
  { pid: 8080, cpu: 61.3, mem: 8.9,  cmd: 'node vite --three' },
  { pid: 220,  cpu: 55.7, mem: 15.2, cmd: 'cargo build --release' },
  { pid: 31,   cpu: 44.1, mem: 6.0,  cmd: 'nmap -sCV target' },
  { pid: 909,  cpu: 39.8, mem: 4.4,  cmd: 'ghidra analyze' },
  { pid: 77,   cpu: 33.2, mem: 9.7,  cmd: 'docker compose up' },
  { pid: 512,  cpu: 27.6, mem: 3.1,  cmd: 'burpsuite --proxy' },
  { pid: 64,   cpu: 21.0, mem: 5.5,  cmd: 'react render hud' },
  { pid: 5,    cpu: 12.4, mem: 2.2,  cmd: 'pwndbg ./chall' },
]

export const SYSLOG = [
  { tag: 'sys', t: 'identity verified — rayan sama @ etyb0c4.core' },
  { tag: 'sys', t: 'mission: build systems before breaking them' },
  { tag: 'dev', t: 'i build my own tools when existing ones slow me down' },
  { tag: 'edu', t: 'Epitech Benin — learning to build before breaking' },
  { tag: 'sec', t: 'active on HackTheBox / Root-Me — web · pwn · rev · forensics' },
  { tag: 'dev', t: 'stack: C · Python · Rust · React · Three.js · Docker' },
  { tag: 'ops', t: 'daily driver: Arch + Hyprland, riced to the bone' },
  { tag: 'sys', t: 'status: open to internships, jobs & things worth building' },
]
