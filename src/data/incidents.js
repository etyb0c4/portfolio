// SECTOR LOG — the real timeline, reframed as system incidents.
// Draft copy derived from PROJECTS (src/data/projects.js) — personal narrative, review before shipping.
export const SECTORS = [
  {
    sector: '01', year: '2025', tag: 'dev',
    title: "L'incident du rendu",
    body: "Premier vrai chantier graphique : un moteur d'échecs 3D dans le navigateur — minimax + alpha-beta, pipeline cinématique (bloom, afterimage), caméra orbitale. Le point de bascule : comprendre que la 3D web tient la route si le moteur derrière est solide.",
    tags: ['Three.js', 'minimax', 'WebGL'],
  },
  {
    sector: '02', year: '2026', tag: 'ops',
    title: 'Le protocole b2r',
    body: "Un agent qui root une machine perd son temps en aller-retours de recon et en sorties d'outils qui noient son contexte. b2r-kit compresse tout ça en une commande — scan, énumération parallèle, état écrit sur disque, prêt à consommer.",
    tags: ['Bash', 'nmap', 'ffuf', 'agents'],
  },
  {
    sector: '03', year: '2026', tag: 'dev',
    title: 'Le noyau réactif',
    body: "Jarvis HUD : une interface qui respire avec l'audio en entrée — React-Three-Fiber, drei, framer-motion. L'expérimentation qui a posé la question : et si l'interface elle-même avait un pouls ?",
    tags: ['React', 'R3F', 'drei'],
  },
  {
    sector: '04', year: 'ongoing', tag: 'sec',
    title: 'Secteurs non cartographiés',
    body: "HackTheBox, Root-Me — web, pwn, reverse, forensics. Chaque machine rootée devient un playbook réutilisable dans l'arsenal. Aucun secteur n'est jamais totalement fermé.",
    tags: ['pwntools', 'Ghidra', 'Burp'],
  },
]
