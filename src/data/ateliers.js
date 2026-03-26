/**
 * @file ateliers.js — source de vérité unique pour les métadonnées des ateliers.
 *
 * @description
 * Avant ce fichier, les métadonnées étaient dupliquées en deux endroits :
 * - `META` dans `App.jsx`        (icon, label, color, light, border, sub)
 * - `CHOICES` dans `SetupScreen` (id, icon, label, sub, color, light, desc, total)
 *
 * Ce module les fusionne en un seul objet `ATELIERS` (clé → entrée) et expose
 * `ATELIERS_LIST` (tableau ordonné) pour `SetupScreen`.
 *
 * ────────────────────────────────────────────────────────────────
 * Champs
 * ────────────────────────────────────────────────────────────────
 * @property {string} id     - Identifiant court ('tg' | 'dq' | 'cu')
 * @property {string} icon   - Emoji représentatif
 * @property {string} label  - Titre court affiché dans la Navbar (ex : "Tangram")
 * @property {string} num    - Numéro lisible (ex : "Atelier 1")
 * @property {string} sub    - Sous-titre décrivant l'usage pédagogique
 * @property {string} color  - Couleur thématique (hex) — texte, icônes
 * @property {string} light  - Couleur de fond claire (hex) — cartes, badges
 * @property {string} border - Couleur de bordure (hex) — badges Navbar
 * @property {string} desc   - Description longue affichée sur la carte SetupScreen
 * @property {number} total  - Nombre de situations (dérivé du tableau de données)
 *
 * @module ateliers
 */

import { TG } from "./tangram.js";
import { DQ } from "./disques.js";
import { CUI } from "./cuisenaire.js";

// ─── Typedef ───────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} AtelierConfig
 * @property {string} id
 * @property {string} icon
 * @property {string} label
 * @property {string} num
 * @property {string} sub
 * @property {string} color
 * @property {string} light
 * @property {string} border
 * @property {string} desc
 * @property {number} total
 */

// ─── Données ───────────────────────────────────────────────────────────────────

/**
 * Map des ateliers indexée par identifiant court.
 *
 * @type {Object.<string, AtelierConfig>}
 */
export const ATELIERS = {
    tg: {
        id: "tg",
        icon: "🔷",
        label: "Tangram",
        num: "Atelier 1",
        sub: "Fractions du carré",
        color: "#2563EB",
        light: "#EFF6FF",
        border: "#BFDBFE",
        desc: "Fractions du carré avec les pièces du Tangram",
        total: TG.length,
    },
    dq: {
        id: "dq",
        icon: "⭕",
        label: "Disques",
        num: "Atelier 2",
        sub: "Fractions du disque",
        color: "#7C3AED",
        light: "#F5F3FF",
        border: "#DDD6FE",
        desc: "Fractions du disque avec les secteurs angulaires",
        total: DQ.length,
    },
    cu: {
        id: "cu",
        icon: "📏",
        label: "Cuisenaire",
        num: "Atelier 3",
        sub: "Fractions des réglettes",
        color: "#B45309",
        light: "#FFFBEB",
        border: "#FDE68A",
        desc: "Fractions des réglettes colorées",
        total: CUI.length,
    },
};

/**
 * Tableau ordonné des ateliers, prêt à l'emploi dans SetupScreen.
 *
 * @type {AtelierConfig[]}
 */
export const ATELIERS_LIST = Object.values(ATELIERS);
