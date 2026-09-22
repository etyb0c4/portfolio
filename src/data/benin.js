// Real Benin outline, projected from public-domain country GeoJSON
// (lon 0.772→3.797, lat 6.142→12.236) onto a 200×403 viewBox.
export const BENIN_VIEWBOX = '0 0 200 403'
export const BENIN_PATH = 'M126.9,395.2 L72.3,402.9 L56.0,357.3 L59.0,205.4 L45.7,191.8 L43.2,159.4 L20.2,136.2 L0.0,116.7 L8.4,81.9 L31.2,74.4 L44.6,45.5 L76.9,39.3 L91.4,19.5 L113.6,0.2 L137.3,0.0 L187.7,38.1 L185.1,60.0 L200.0,99.2 L187.0,125.9 L193.9,143.6 L161.9,184.6 L141.5,204.8 L129.0,246.5 L130.7,288.6 L126.9,395.2 Z'

// Relics sit on real Beninese cities, projected with the same transform.
// Chosen to spread south→north so no two markers collide on screen.
export const RELICS = [
  { id: 'ctf',        x: 143.3, y: 73.1,  city: 'Kandi' },
  { id: 'jarvis-hud', x: 122.8, y: 191.5, city: 'Parakou' },
  { id: 'chess3d',    x: 80.5,  y: 334.3, city: 'Abomey' },
  { id: 'b2r-kit',    x: 108.9, y: 387.8, city: 'Cotonou' },
]

export const HOME = { x: 108.9, y: 387.8 }
