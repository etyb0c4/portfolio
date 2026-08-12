# Guide : animation de portes qui s'ouvrent (React + 3 images)

Ce guide t'explique **chaque brique** pour que tu codes toi-même, étape par étape. Rien n'est à copier-coller en bloc : construis-le progressivement et teste à chaque étape.

## 1. Prépare tes 3 images

Dans ton dossier `public/` (Create React App / Vite), crée un sous-dossier `images/` avec :

```
public/images/porte-gauche.png
public/images/porte-droite.png
public/images/fond.jpg
```

Astuces de cadrage, important pour un bon rendu :
- `porte-gauche.png` : le battant gauche seul, cadré serré, avec le bord de la charnière (extérieur, côté mur) bien à gauche de l'image
- `porte-droite.png` : symétrique, la charnière à droite
- Les deux images de portes doivent avoir la **même hauteur** en pixels
- `fond.jpg` : la scène visible une fois ouvert (peut être plus grande, elle sera recadrée en `background-size: cover`)

## 2. Squelette du composant

Commence par la structure de base, sans style, juste pour voir les éléments s'afficher :

```jsx
import { useState } from "react";

export default function GoldenGate() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="stage">
      <div className="sky" />
      <div className="door door-left" />
      <div className="door door-right" />
    </div>
  );
}
```

À ce stade : rien ne s'affiche encore car il n'y a pas de CSS. C'est normal, on l'ajoute étape par étape.

## 3. Le conteneur en 3D (`.stage`)

C'est la base de tout l'effet : sans `perspective`, les rotations 3D des portes auraient l'air plates, sans profondeur.

```css
.stage {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  perspective: 2400px;       /* distance "œil -> écran" : plus petit = effet plus prononcé */
  perspective-origin: 50% 50%;
}
```

**Teste seul ce point** en ajoutant temporairement `background: red` à `.stage` pour vérifier qu'il prend bien tout l'écran.

## 4. Le fond (`.sky`)

```css
.sky {
  position: absolute;
  inset: 0;
  background-image: url("/images/fond.jpg");
  background-size: cover;
  background-position: center;
}
```

Le fond reste **toujours en place**, derrière tout le reste (`z-index` par défaut = 0). Ce sont les portes qui bougent pour le révéler, pas lui.

## 5. Les deux battants

Chaque porte est un `div` positionné en absolu, occupant la moitié de l'écran, avec son image en fond :

```css
.door {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transform-style: preserve-3d;   /* indispensable pour un vrai effet 3D */
  transition: transform 1.6s cubic-bezier(.6,.05,.15,1);
  cursor: pointer;
  z-index: 2;
}

.door-left {
  left: 0;
  background-image: url("/images/porte-gauche.png");
  transform-origin: left center;   /* la porte pivote depuis SA charnière gauche */
}

.door-right {
  right: 0;
  background-image: url("/images/porte-droite.png");
  transform-origin: right center;  /* pivote depuis SA charnière droite */
}
```

Point clé à bien comprendre : **`transform-origin`** définit l'axe de rotation. Une vraie porte pivote depuis sa charnière, pas depuis son centre — c'est pour ça que la porte gauche pivote depuis son bord gauche, et la droite depuis son bord droit.

À cette étape, tu dois voir tes deux images de portes côte à côte, couvrant tout l'écran, avec le fond cachés dessous.

## 6. L'ouverture au clic

Ajoute l'état et le gestionnaire de clic dans le JSX :

```jsx
<div className="stage">
  <div className="sky" />
  <div
    className={`door door-left ${isOpen ? "open" : ""}`}
    onClick={() => setIsOpen(true)}
  />
  <div
    className={`door door-right ${isOpen ? "open" : ""}`}
    onClick={() => setIsOpen(true)}
  />
</div>
```

Puis en CSS, la rotation quand la classe `.open` est présente :

```css
.door-left.open  { transform: rotateY(-112deg); }
.door-right.open { transform: rotateY(112deg); }
```

**Pourquoi 112° et pas 90° ?** À 90° pile, une porte plate devient une ligne invisible pile face à la caméra, ce qui peut créer un effet de "clignotement" bizarre. Aller un peu au-delà (100-120°) donne un mouvement plus naturel et évite ce problème.

Teste maintenant : clique sur une porte → elle doit pivoter et laisser voir le fond derrière.

## 7. Révéler du contenu après l'ouverture

Si tu veux faire apparaître du texte (nom, titre) une fois les portes ouvertes, utilise un délai avec `useEffect` :

```jsx
import { useState, useEffect } from "react";

export default function GoldenGate() {
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 1400);
      return () => clearTimeout(timer); // nettoyage si le composant se démonte
    }
  }, [isOpen]);

  // ...
}
```

Le délai de `1400ms` correspond à peu près à la durée de la transition CSS (`1.6s`), pour que le texte apparaisse juste après que les portes se soient écartées.

```jsx
<div className={`content ${showContent ? "show" : ""}`}>
  <h1>Ton Nom</h1>
</div>
```

```css
.content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 1.2s ease;
  pointer-events: none;
  z-index: 3;
}
.content.show { opacity: 1; }
```

## 8. Détails qui font la différence

**Ombre au centre pour cacher un éventuel raccord imparfait entre les deux portes :**
```css
.door-left  { box-shadow: 4px 0 12px rgba(0,0,0,0.4); }
.door-right { box-shadow: -4px 0 12px rgba(0,0,0,0.4); }
```

**Empêcher le clic une fois ouvert** (évite de re-déclencher l'animation) :
```jsx
onClick={() => !isOpen && setIsOpen(true)}
```

**Responsive mobile** — sur petit écran, réduis la perspective pour un effet moins écrasé :
```css
@media (max-width: 600px) {
  .stage { perspective: 1400px; }
}
```

**Accessibilité** — remplace les `div` cliquables par un vrai `<button>` stylé, ou ajoute `role="button"` + `tabIndex={0}` + gestion de la touche Entrée, pour que ce soit utilisable au clavier.

## 9. Checklist finale

- [ ] Les 3 images sont dans `public/images/`
- [ ] `.stage` a bien `perspective` et `overflow: hidden`
- [ ] Chaque porte a le bon `transform-origin` (gauche → `left center`, droite → `right center`)
- [ ] La transition CSS est sur `.door`, pas sur `.door.open` (sinon elle ne s'anime pas au retour)
- [ ] Le clic met bien `isOpen` à `true` via `setIsOpen`
- [ ] Le fond est visible une fois les deux portes pivotées

Une fois ces étapes validées une par une, tu auras un composant entièrement compris et personnalisable — plus facile à faire évoluer que si tu avais juste copié un bloc tout fait.
