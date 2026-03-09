/**
 * @file Données des situations pédagogiques pour l'atelier Disques.
 * @see AtelierDisques
 *
 * Structure d'une situation :
 * - n      {number} Nombre de secteurs égaux du disque
 * - ai     {number} Index du secteur actif (coloré en permanence)
 * - color  {string} Couleur principale (hex)
 * - light  {string} Couleur de fond du disque (hex)
 *
 * @typedef {Object} DisqueSituation
 * @property {number} n
 * @property {number} ai
 * @property {string} color
 * @property {string} light
 */

/** @type {DisqueSituation[]} */
export const DQ = [
    { n: 2, ai: 0, color: "#7C3AED", light: "#EDE9FE" },
    { n: 3, ai: 0, color: "#16A34A", light: "#DCFCE7" },
    { n: 4, ai: 1, color: "#0891B2", light: "#CFFAFE" },
    { n: 5, ai: 0, color: "#B45309", light: "#FEF3C7" },
    { n: 6, ai: 1, color: "#0F766E", light: "#CCFBF1" },
    { n: 8, ai: 2, color: "#DB2777", light: "#FCE7F3" },
    { n: 10, ai: 3, color: "#DC2626", light: "#FEE2E2" },
];
