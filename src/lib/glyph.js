/* Shape matching for the rite: does the drawn mark actually look like an "R"?
   Both the template and the drawing are rasterized into the same small grid, then compared
   two ways — a single score is not enough:
     precision = how much of what you drew lies on the letter  (rejects extra scribble)
     recall    = how much of the letter you actually covered   (rejects a circle, a line, a blob)
   A shape has to satisfy both, so neither "drew inside the R but only a bit" nor
   "covered the R but drew far more than it" gets through. */

const R_PATH = 'M28,124 L28,16 L60,16 Q80,16 80,44 Q80,68 58,68 L28,68 M58,68 L82,124'
const R_BOX = { x: 28, y: 16, w: 54, h: 108 }

const GW = 42, GH = 84   // template grid — R is roughly 1:2
const PEN = 9            // stroke thickness in grid pixels
const TOL = 2            // dilation radius (how far off the line you may wander)

function maskOf(cv) {
  const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data
  const m = new Uint8Array(cv.width * cv.height)
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 40 ? 1 : 0
  return m
}

function dilate(mask, w, h, r) {
  const out = new Uint8Array(mask.length)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!mask[y * w + x]) continue
    const y0 = Math.max(0, y - r), y1 = Math.min(h - 1, y + r)
    const x0 = Math.max(0, x - r), x1 = Math.min(w - 1, x + r)
    for (let ny = y0; ny <= y1; ny++) for (let nx = x0; nx <= x1; nx++) out[ny * w + nx] = 1
  }
  return out
}


/** ink density inside a normalized sub-rectangle of the grid (0..1 coords) */
function inkIn(mask, x0, y0, x1, y1) {
  let on = 0, total = 0
  const gy0 = Math.floor(y0 * GH), gy1 = Math.max(gy0 + 1, Math.ceil(y1 * GH))
  const gx0 = Math.floor(x0 * GW), gx1 = Math.max(gx0 + 1, Math.ceil(x1 * GW))
  for (let y = gy0; y < Math.min(gy1, GH); y++)
    for (let x = gx0; x < Math.min(gx1, GW); x++) { total++; if (mask[y * GW + x]) on++ }
  return total ? on / total : 0
}

/* An R has anatomy that overlap scores alone cannot see: a full-height stem on the left,
   a closed bowl top-right, a leg kicking out to the bottom-right — and, crucially, an OPEN
   bottom edge between stem and leg. Without these, a circle, a square and a P all score well
   against a filled R mask. Each gate below rejects a specific impostor. */
function anatomy(U) {
  const stemBottom = inkIn(U, 0.00, 0.86, 0.34, 1.00) > 0.015   // foot of the stem
  const legBottom  = inkIn(U, 0.56, 0.86, 1.00, 1.00) > 0.015   // foot of the leg  (P has none)
  const bowl       = inkIn(U, 0.55, 0.02, 1.00, 0.36) > 0.015   // the bowl, top-right
  const openFoot   = inkIn(U, 0.36, 0.90, 0.53, 1.00) < 0.02    // gap between the feet (O/square fail)
  // the stem must actually run the whole height, not just touch top and bottom
  const stem = [[0.06, 0.28], [0.38, 0.60], [0.66, 0.86]]
    .every(([a, b]) => inkIn(U, 0.00, a, 0.28, b) > 0.012)
  if (!stem)       return 'no stem'
  if (!bowl)       return 'no bowl'
  if (!legBottom)  return 'no leg'
  if (!stemBottom) return 'stem does not reach the base'
  if (!openFoot)   return 'closed at the base'
  return null
}

let TEMPLATE = null
function template() {
  if (TEMPLATE) return TEMPLATE
  const cv = document.createElement('canvas')
  cv.width = GW; cv.height = GH
  const x = cv.getContext('2d')
  const sx = GW / R_BOX.w, sy = GH / R_BOX.h
  x.save()
  x.scale(sx, sy)
  x.translate(-R_BOX.x, -R_BOX.y)
  x.strokeStyle = '#fff'
  x.lineCap = 'round'; x.lineJoin = 'round'
  x.lineWidth = PEN / ((sx + sy) / 2)   // lineWidth is in pre-scale units
  x.stroke(new Path2D(R_PATH))
  x.restore()
  TEMPLATE = maskOf(cv)
  return TEMPLATE
}

/** strokes: array of arrays of {x,y} in any coordinate space */
function rasterStrokes(strokes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const s of strokes) for (const p of s) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y
  }
  const w = maxX - minX, h = maxY - minY
  if (!isFinite(w) || !isFinite(h)) return null
  // normalize the drawing into the template box, keeping it centred and preserving
  // aspect only loosely (people draw wide or narrow Rs)
  const sx = GW / Math.max(w, 1e-3), sy = GH / Math.max(h, 1e-3)
  const cv = document.createElement('canvas')
  cv.width = GW; cv.height = GH
  const x = cv.getContext('2d')
  x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = PEN
  for (const s of strokes) {
    if (s.length < 2) continue
    x.beginPath()
    s.forEach((p, i) => {
      const px = (p.x - minX) * sx, py = (p.y - minY) * sy
      if (i) x.lineTo(px, py); else x.moveTo(px, py)
    })
    x.stroke()
  }
  return { mask: maskOf(cv), w, h }
}

function count(m) { let n = 0; for (let i = 0; i < m.length; i++) n += m[i]; return n }
function overlap(a, b) { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] && b[i]) n++; return n }

/**
 * Score a drawing against the letter R.
 * Returns { ok, precision, recall, reason }.
 */
export function matchR(strokes) {
  const pts = strokes.reduce((n, s) => n + s.length, 0)
  if (pts < 10) return { ok: false, precision: 0, recall: 0, reason: 'too short' }

  const drawn = rasterStrokes(strokes)
  if (!drawn) return { ok: false, precision: 0, recall: 0, reason: 'empty' }

  // an R is clearly taller than wide; a flat scrawl or a wide blob is not an R
  const ratio = drawn.h / Math.max(drawn.w, 1e-3)
  if (ratio < 0.85) return { ok: false, precision: 0, recall: 0, reason: 'too wide' }

  const T = template()
  const U = drawn.mask
  const tN = count(T), uN = count(U)
  if (!tN || !uN) return { ok: false, precision: 0, recall: 0, reason: 'empty' }

  const precision = overlap(U, dilate(T, GW, GH, TOL)) / uN
  const recall = overlap(T, dilate(U, GW, GH, TOL)) / tN

  const flaw = anatomy(U)
  if (flaw) return { ok: false, precision, recall, reason: flaw }

  const ok = precision >= 0.62 && recall >= 0.55
  return { ok, precision, recall, reason: ok ? 'match' : 'not an R' }
}
