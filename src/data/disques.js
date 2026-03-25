/**
 * @file Données des situations pédagogiques pour l'atelier Disques.
 * @see AtelierDisques
 *
 * Structure d'une situation :
 * - n      {number} Nombre de parts égalex du disque
 * - ai     {number} Index de la part active (colorée en permanence)
 * - color  {string} Couleur principale (hex)
 * - light  {string} Couleur de fond du disque (hex)
 * - rot    {number} Rotation (degrés) appliquée au modèle de la part
 *                   pour éviter l'orientation prototypique (corde verticale
 *                   ou pointe alignée sur un axe cardinal)
 *
 * @typedef {Object} DisqueSituation
 * @property {number} n
 * @property {number} ai
 * @property {string} color
 * @property {string} light
 * @property {number} rot
 */

/** @type {DisqueSituation[]} */
export const DQ = [
    { n: 2, ai: 0, color: "#7C3AED", light: "#EDE9FE", rot: 40 }, // demi : corde verticale → incliné
    { n: 3, ai: 0, color: "#16A34A", light: "#DCFCE7", rot: 25 }, // tiers : pointe en haut → décalé
    { n: 4, ai: 1, color: "#0891B2", light: "#CFFAFE", rot: 22 }, // quart : côtés cardinaux → incliné
    { n: 5, ai: 0, color: "#B45309", light: "#FEF3C7", rot: 18 }, // cinquième : déjà décalé, léger
    { n: 6, ai: 1, color: "#0F766E", light: "#CCFBF1", rot: 30 }, // sixième : pointe à 60° → tourné
    { n: 8, ai: 2, color: "#DB2777", light: "#FCE7F3", rot: 20 }, // huitième : bissectrice → incliné
    { n: 10, ai: 3, color: "#DC2626", light: "#FEE2E2", rot: 15 }, // dixième : position basse → léger
];
