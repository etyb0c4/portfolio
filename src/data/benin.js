// Real Benin outline, projected from public-domain country GeoJSON
// (lon 0.772→3.797, lat 6.142→12.236) onto a 200×403 viewBox.
export const BENIN_VIEWBOX = '0 0 200 403'
export const BENIN_PATH = 'M126.9,395.2 L72.3,402.9 L56.0,357.3 L59.0,205.4 L45.7,191.8 L43.2,159.4 L20.2,136.2 L0.0,116.7 L8.4,81.9 L31.2,74.4 L44.6,45.5 L76.9,39.3 L91.4,19.5 L113.6,0.2 L137.3,0.0 L187.7,38.1 L185.1,60.0 L200.0,99.2 L187.0,125.9 L193.9,143.6 L161.9,184.6 L141.5,204.8 L129.0,246.5 L130.7,288.6 L126.9,395.2 Z'

// Relics sit on real Beninese cities, projected with the same transform.
// Spread south→north so no two markers collide on screen.
export const RELICS = [
  { id: 'ctf',        x: 143.3, y: 73.1  },
  { id: 'jarvis-hud', x: 122.8, y: 191.5 },
  { id: 'chess3d',    x: 80.5,  y: 334.3 },
  { id: 'b2r-kit',    x: 108.9, y: 387.8 },
]

export const HOME = { x: 108.9, y: 387.8 }

/* Neighbouring countries, projected with the exact same transform so they line up with
   BENIN_PATH. They exist to place the country for anyone who does not recognise the
   outline on sight — naming Niger, Nigeria, Togo and Burkina Faso around it says
   "West Africa" far better than a label on its own. Coordinates are clipped to a window
   around Benin, so these are context silhouettes, not complete borders. */
export const NEIGHBOURS = [
  { id: 'NER', name: 'NIGER',        at: [150, -120], d: 'M91,20 L93,-26 L17,-41 L15,-73 L-23,-116 L-32,-146 L-26,-178 L16,-181 L41,-204 L131,-210 L189,-220 L195,-261 L231,-300 L231,-300 L324,-300 L516,-300 L700,-300 L700,-300 L700,-300 L700,-300 L700,-300 L700,-300 L700,-300 L700,-300 L700,-300 L700,-300 L700,-290 L700,-228 L700,-141 L700,-116 L700,-74 L700,-72 L700,-41 L700,-37 L700,-16 L700,-15 L700,-87 L700,-90 L700,-53 L700,-72 L676,-76 L656,-67 L618,-69 L579,-41 L545,-39 L465,-73 L434,-57 L400,-58 L375,-83 L309,-108 L238,-100 L221,-86 L211,-48 L192,-21 L188,38 L137,-0 L114,0 L91,20 Z' },
  { id: 'NGA', name: 'NIGERIA',      at: [330,  300], d: 'M511,493 L442,517 L417,514 L392,529 L339,527 L304,486 L282,438 L235,394 L185,395 L127,395 L131,289 L129,247 L141,205 L162,185 L194,144 L187,126 L200,99 L185,60 L188,38 L192,-21 L211,-48 L221,-86 L238,-100 L309,-108 L375,-83 L400,-58 L434,-57 L465,-73 L545,-39 L579,-41 L618,-69 L656,-67 L676,-76 L700,-72 L700,-53 L700,-90 L700,-87 L700,-15 L700,-16 L700,10 L700,22 L700,44 L700,95 L700,137 L700,172 L700,186 L700,233 L700,260 L700,293 L700,320 L700,347 L680,370 L643,343 L618,344 L579,382 L559,383 L528,447 L511,493 Z' },
  { id: 'TGO', name: 'TOGO',         at: [-36,  250], d: 'M72,403 L19,417 L4,394 L-13,352 L-19,319 L-4,259 L-21,235 L-27,183 L-27,135 L-54,101 L-49,80 L8,82 L0,117 L20,136 L43,159 L46,192 L59,205 L56,357 L72,403 Z' },
  { id: 'BFA', name: 'BURKINA FASO', at: [-250,  40], d: 'M-238,171 L-283,154 L-314,157 L-337,174 L-367,160 L-379,138 L-400,123 L-400,85 L-395,57 L-396,34 L-344,-20 L-334,-66 L-316,-82 L-284,-73 L-256,-86 L-247,-103 L-196,-133 L-183,-154 L-122,-181 L-85,-190 L-69,-178 L-26,-178 L-32,-146 L-23,-116 L15,-73 L17,-41 L93,-26 L91,20 L77,39 L45,45 L31,74 L8,82 L-49,80 L-80,75 L-101,86 L-131,81 L-245,84 L-247,122 L-238,171 Z' },
  { id: 'GHA', name: 'GHANA',        at: [-190, 330], d: 'M19,417 L-85,456 L-121,478 L-181,498 L-240,479 L-237,453 L-266,396 L-248,321 L-220,266 L-238,171 L-247,122 L-245,84 L-131,81 L-101,86 L-80,75 L-49,80 L-54,101 L-27,135 L-27,183 L-21,235 L-4,259 L-19,319 L-13,352 L4,394 L19,417 Z' },
]

// the sea, so south reads as the coast
export const GULF_LABEL = { name: "GOLFE DE GUINÉE", at: [120, 470] }

// wide frame that fits Benin plus its surroundings
export const CONTEXT_VIEWBOX = '-330 -180 1000 760'
