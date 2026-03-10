# Fractions CE1 — U1S6

Application web pédagogique accompagnant la **séance 6 de la séquence sur les fractions au CE1**, conçue selon les principes de l'enseignement explicite. Développée dans le cadre du projet CAREC (Grenoble), sur la base des travaux de recherche d'André Tricot (modes opératoires).

---

## Contexte pédagogique

L'application propose trois ateliers manipulant des matériaux différents, tous articulés autour de la même structure en deux phases :

1. **Phase de comptage** — l'élève détermine empiriquement combien de parts égales sont nécessaires pour reconstituer le tout.
2. **Phase de nommage** — l'élève choisit le nom littéral de la fraction parmi quatre propositions.

Un **indice** est disponible à la demande dans l'atelier Cuisenaire (situations de fraction unité uniquement).

La correction est immédiate et procédurale : les messages de feedback ne donnent pas la réponse, ils rappellent la procédure ou la règle de nommage (d'après le modèle A. Tricot).

---

## Ateliers

| Atelier                | Matériau            | Situations | Points max |
| ---------------------- | ------------------- | ---------- | ---------- |
| Atelier 1 — Tangram    | Pièces du carré     | 5          | 10         |
| Atelier 2 — Disques    | Secteurs angulaires | 7          | 14         |
| Atelier 3 — Cuisenaire | Réglettes colorées  | 6          | 11         |

> **Note sur le score Cuisenaire :** la situation non-unitaire (réglette violette = deux cinquièmes) ne comporte pas de phase de comptage ; elle vaut 1 point au lieu de 2. Score maximal : `6 × 2 − 1 = 11`.

### Fractions couvertes

- **Tangram** : un demi (×2), un quart (×2), un huitième
- **Disques** : un demi, un tiers, un quart, un cinquième, un sixième, un huitième, un dixième
- **Cuisenaire** : un dixième, un cinquième, un demi, un tiers, un sixième, deux cinquièmes

---

## Fonctionnalités

### Côté élève

- Ajout et retrait de pièces/secteurs/réglettes un à un.
- Validation explicite par un bouton ("Le carré est rempli !", etc.).
- Feedback visuel immédiat (vert = correct, rouge = erreur) avec message procédural.
- Bouton "Continuer →" intégré dans le feedback positif : l'élève contrôle le rythme de progression.
- Modale d'avertissement si l'élève tente d'ajouter alors que le tout est déjà couvert.
- Écran de résultat final avec taux de réussite et possibilité de recommencer.

### Côté enseignant·e

- **Accès au menu enseignant** : appui long (≥ 2 secondes) sur le titre ou le badge d'atelier dans l'en-tête.
- **Tableau de bord** accessible à tout moment via le bouton "📊 Tableau de bord" dans l'en-tête.
- **Changement d'atelier** : réinitialise l'application et revient à l'écran de sélection.

### Tableau de bord

Toutes les statistiques sont dérivées à la volée depuis le journal d'événements (`useMemo`) — aucun état n'est dupliqué.

Sections affichées :

- Temps écoulé (mis à jour chaque seconde via `LiveTimer`)
- Avancement situation par situation (nombre de situations terminées / total)
- Taux de réussite au premier essai (comptage + nommage combinés)
- Frise de progression colorée par situation (`SituationDot`)
- Tableau détaillé : erreurs de comptage, erreurs de nommage, durée, utilisation de l'indice
- Erreurs de nommage agrégées : distracteurs choisis, fréquence, réponse attendue (`ErrPill`)
- Situation actuellement en cours

Statuts d'une situation terminée :

| Statut               | Condition                                                    |
| -------------------- | ------------------------------------------------------------ |
| `perfect` (vert)     | `fullScore === true` (0 erreur comptage ET 0 erreur nommage) |
| `good` (ambre)       | `countErrors + nameErrors ≤ 2`                               |
| `struggled` (orange) | `countErrors + nameErrors > 2`                               |

Le tableau de bord est imprimable (`window.print()`). Les éléments de navigation sont masqués via `@media print` (classe `.no-print`).

---

## Journal d'événements

Chaque interaction pédagogique est horodatée dans un journal centralisé (`useEventLog`). Le journal est réinitialisé à chaque changement d'atelier.

| Type           | Données caractéristiques                                                               |
| -------------- | -------------------------------------------------------------------------------------- |
| `SIT_START`    | `{ idx, id, label }`                                                                   |
| `COUNT_ERR`    | `{ idx, placed, expected }`                                                            |
| `COUNT_OK`     | `{ idx, countErrors }`                                                                 |
| `NAME_ERR`     | `{ idx, chosen, answer, errN }`                                                        |
| `NAME_OK`      | `{ idx, nameErrors }`                                                                  |
| `HINT_USED`    | `{ idx }`                                                                              |
| `SIT_DONE`     | `{ idx, label, n, answer, countErrors, nameErrors, durationMs, hintUsed?, fullScore }` |
| `ATELIER_DONE` | `{ maxScore, durationMs }`                                                             |

---

## Stack technique

| Outil        | Version |
| ------------ | ------- |
| React        | 19.2.0  |
| react-dom    | 19.2.0  |
| Vite         | 7.3.1   |
| Tailwind CSS | 3.4.17  |
| prop-types   | 15.8.1  |
| PostCSS      | 8.5.8   |
| autoprefixer | 10.4.27 |

Pas de TypeScript. Pas de gestionnaire d'état externe (pas de Redux, pas de Zustand). Pas de Context API — le prop drilling est limité à deux niveaux (`App` → atelier).

Polices chargées via Google Fonts : **Fredoka** (titres) et **Nunito** (corps).

---

## Architecture

```
src/
├── main.jsx
├── App.jsx
├── index.css
├── data/
│   ├── tangram.js          # 5 situations, coordonnées SVG des polygones
│   ├── disques.js          # 7 situations, paramètres des secteurs
│   └── cuisenaire.js       # 6 situations, longueurs des réglettes (UNIT = 22 px)
├── utils/
│   ├── svg.js              # polar(), arc() — fonctions pures
│   ├── time.js             # fmtMs() — formatage durée
│   └── feedback.js         # FNAME, messages de feedback procéduraux
├── hooks/
│   └── useEventLog.js      # events, log, resetLog
└── components/
    ├── SetupScreen.jsx
    ├── TeacherMenu.jsx
    ├── ui/
    │   ├── Btn.jsx          # états : idle / ok / err / off
    │   ├── Bubble.jsx       # types : ok / err / hint
    │   ├── ProgDots.jsx
    │   ├── CountBlocks.jsx
    │   ├── DoneScreen.jsx
    │   └── FullModal.jsx
    ├── ateliers/
    │   ├── AtelierTangram.jsx
    │   ├── AtelierDisques.jsx
    │   └── AtelierCuisenaire.jsx
    └── dashboard/
        ├── Dashboard.jsx
        ├── SituationDot.jsx
        ├── ErrPill.jsx
        └── LiveTimer.jsx
```

---

## Installation

**Prérequis :** Node.js ≥ 18, pnpm.

```bash
# 1. Créer le projet Vite
pnpm create vite@latest fractions-ce1 -- --template react
cd fractions-ce1

# 2. Installer les dépendances runtime
pnpm install
pnpm add prop-types

# 3. Installer les dépendances de développement
pnpm add -D tailwindcss@^3.4.17 postcss autoprefixer

# 4. Initialiser Tailwind (génère tailwind.config.js et postcss.config.js)
pnpm dlx tailwindcss init -p
```

Copier ensuite les fichiers sources dans `src/`, puis vérifier que `index.html` pointe bien vers :

```html
<script type="module" src="/src/main.jsx"></script>
```

---

## Démarrage

```bash
# Développement (hot reload)
pnpm dev

# Production
pnpm build
pnpm preview

# Lint
pnpm lint
```

---

## Configuration Tailwind

`tailwind.config.js` — déclaration des chemins analysés pour le purge JIT :

```js
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: { extend: {} },
    plugins: [],
};
```

---

## Choix de conception notables

- **Pas de `setTimeout` pour les feedbacks** : la progression est entièrement pilotée par l'élève via le bouton "Continuer →". Aucun délai automatique.
- **`placed` part de 0** dans les trois ateliers : le tout est vide au départ, l'élève construit la représentation.
- **Visualisation côte à côte** (tout en cours de remplissage | modèle de la part) : même `viewBox`, même taille CSS — la proportion est perceptible directement. Le modèle de la part est tourné d'un angle non-prototypique (champ `rot` dans les données) pour éviter les orientations canoniques.
- **Situation non-unitaire Cuisenaire** (réglette violette = deux cinquièmes) : phase `explain` au lieu de `count`, pilotée par l'enseignant·e avant le nommage.
- **`useCallback`** appliqué uniquement aux handlers passés en props ou susceptibles d'être capturés dans une closure de timer.
- **Animations** définies en CSS global (classes `.kf-pop`, `.kf-shake`, `.kf-in`, `.kf-up`, `.kf-ping`) — pas de bibliothèque d'animation externe.

---

## Crédits

- Séquence pédagogique et modes opératoires : **André Tricot**
- Projet : **CAREC Grenoble**
- Séance : **6/6** de la séquence fractions CE1
