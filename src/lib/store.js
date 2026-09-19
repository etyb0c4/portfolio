// tiny global bridge between DOM/scroll and the WebGL field
if (typeof window !== 'undefined' && !window.__gl) window.__gl = { progress: 0, heat: 0 }

export const setProgress = (p) => { if (window.__gl) window.__gl.progress = Math.max(0, Math.min(1, p)) }
export const flash = (amount = 0.8) => { if (window.__gl) window.__gl.heat = Math.min(1.4, window.__gl.heat + amount) }

// privilege stages tied to scroll
export const STAGES = [
  { at: 0.00, uid: 'guest',      host: 'node-0',  color: '#9a8f8b' },
  { at: 0.30, uid: 'rayan',      host: 'workstation', color: '#e5514a' },
  { at: 0.62, uid: 'www-data',   host: 'arsenal', color: '#e5514a' },
  { at: 0.86, uid: 'root',       host: 'rayan.dev', color: '#ff6a5a' },
]
export const stageFor = (p) => { let s = STAGES[0]; for (const x of STAGES) if (p >= x.at) s = x; return s }
