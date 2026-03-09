/**
 * @file Données des situations pédagogiques pour l'atelier Cuisenaire.
 * @see AtelierCuisenaire
 *
 * Unité de base : UNIT = 22 px par longueur de réglette.
 *
 * Structure d'une situation :
 * - len     {number}      Longueur de la réglette étudiée (unités)
 * - bg      {string}      Couleur de fond de la réglette étudiée
 * - bd      {string}      Couleur de bordure de la réglette étudiée
 * - name    {string}      Nom de la couleur (ex : "blanche")
 * - refLen  {number}      Longueur de la réglette de référence (le "tout")
 * - refBg   {string}      Couleur de fond de la réglette de référence
 * - refBd   {string}      Couleur de bordure de la réglette de référence
 * - refName {string}      Nom de la réglette de référence
 * - n       {number|null} Nombre de réglettes étudiées pour couvrir la référence
 * - answer  {string}      Fraction attendue (libellé littéral)
 * - nonUnit {boolean}     Vrai si la réglette ne correspond pas à une fraction unité
 * - fOpts   {string[]}    Quatre options de nommage
 * - hint    {string}      Texte de l'indice (optionnel, affiché sur demande)
 *
 * @typedef {Object} CuisenaireSituation
 * @property {number}      len
 * @property {string}      bg
 * @property {string}      bd
 * @property {string}      name
 * @property {number}      refLen
 * @property {string}      refBg
 * @property {string}      refBd
 * @property {string}      refName
 * @property {number|null} n
 * @property {string}      answer
 * @property {boolean}     nonUnit
 * @property {string[]}    fOpts
 * @property {string}      hint
 */

/** Largeur SVG d'une unité de réglette (px) */
export const UNIT = 22;

/** @type {CuisenaireSituation[]} */
export const CUI = [
    {
        len: 1,
        bg: "#F9FAFB",
        bd: "#9CA3AF",
        name: "blanche",
        refLen: 10,
        refBg: "#F97316",
        refBd: "#C2410C",
        refName: "orange",
        n: 10,
        answer: "un dixième",
        nonUnit: false,
        fOpts: ["un dixième", "un cinquième", "un huitième", "un quart"],
        hint: "Il faut 10 réglettes blanches pour couvrir la réglette orange.",
    },
    {
        len: 2,
        bg: "#EF4444",
        bd: "#B91C1C",
        name: "rouge",
        refLen: 10,
        refBg: "#F97316",
        refBd: "#C2410C",
        refName: "orange",
        n: 5,
        answer: "un cinquième",
        nonUnit: false,
        fOpts: ["un cinquième", "un dixième", "un quart", "un demi"],
        hint: "Il faut 5 réglettes rouges pour couvrir la réglette orange.",
    },
    {
        len: 5,
        bg: "#EAB308",
        bd: "#CA8A04",
        name: "jaune",
        refLen: 10,
        refBg: "#F97316",
        refBd: "#C2410C",
        refName: "orange",
        n: 2,
        answer: "un demi",
        nonUnit: false,
        fOpts: ["un demi", "un quart", "un cinquième", "deux cinquièmes"],
        hint: "Il faut 2 réglettes jaunes pour couvrir la réglette orange.",
    },
    {
        len: 2,
        bg: "#EF4444",
        bd: "#B91C1C",
        name: "rouge",
        refLen: 6,
        refBg: "#16A34A",
        refBd: "#166534",
        refName: "vert foncé",
        n: 3,
        answer: "un tiers",
        nonUnit: false,
        fOpts: ["un tiers", "un sixième", "un quart", "un demi"],
        hint: "Il faut 3 réglettes rouges pour couvrir la réglette vert foncé.",
    },
    {
        len: 1,
        bg: "#F9FAFB",
        bd: "#9CA3AF",
        name: "blanche",
        refLen: 6,
        refBg: "#16A34A",
        refBd: "#166534",
        refName: "vert foncé",
        n: 6,
        answer: "un sixième",
        nonUnit: false,
        fOpts: ["un sixième", "un tiers", "un huitième", "un dixième"],
        hint: "Il faut 6 réglettes blanches pour couvrir la réglette vert foncé.",
    },
    {
        len: 4,
        bg: "#A855F7",
        bd: "#7E22CE",
        name: "violette",
        refLen: 10,
        refBg: "#F97316",
        refBd: "#C2410C",
        refName: "orange",
        n: null,
        answer: "deux cinquièmes",
        nonUnit: true,
        fOpts: ["deux cinquièmes", "un cinquième", "deux dixièmes", "un demi"],
        hint: "La réglette violette = 2 réglettes rouges. La rouge est un cinquième. Donc la violette = 2 × un cinquième.",
    },
];
