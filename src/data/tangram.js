/**
 * @file Données des situations pédagogiques pour l'atelier Tangram.
 *
 * @description
 * Chaque situation décrit une pièce du Tangram à positionner dans un carré.
 * La structure sépare les données (ici) de la logique d'affichage (composant).
 *
 * Structure d'une situation :
 * - id          {string}   Identifiant unique
 * - label       {string}   Nom affiché dans le journal
 * - pieceLabel  {string}   Nom de la pièce (utilisé dans les messages)
 * - color       {string}   Couleur principale (hex) de la pièce active
 * - ghostC      {string}   Couleur de remplissage des fantômes (hex)
 * - active      {string}   Points SVG de la pièce toujours visible
 * - ghosts      {string[]} Points SVG des emplacements à remplir
 * - n           {number}   Nombre de pièces nécessaires pour remplir le tout
 * - answer      {string}   Fraction attendue (libellé littéral)
 * - tout        {string}   Nom du tout (utilisé dans les messages)
 * - fOpts       {string[]} Quatre options de nommage proposées à l'élève
 * - rot         {number}   Rotation (degrés) appliquée au modèle de la part
 *                          pour éviter l'orientation prototypique
 */

/** @typedef {Object} TangramSituation
 * @property {string}   id
 * @property {string}   label
 * @property {string}   pieceLabel
 * @property {string}   color
 * @property {string}   ghostC
 * @property {string}   active
 * @property {string[]} ghosts
 * @property {number}   n
 * @property {string}   answer
 * @property {string}   tout
 * @property {string[]} fOpts
 * @property {number}   rot
 */

/** @type {TangramSituation[]} */
export const TG = [
    {
        id: "tg1",
        label: "Grand triangle ①",
        pieceLabel: "grand triangle",
        color: "#2563EB",
        ghostC: "#BFDBFE",
        active: "10,10 190,10 10,190",
        ghosts: ["190,10 190,190 10,190"],
        n: 2,
        answer: "un demi",
        tout: "carré",
        fOpts: ["un demi", "un tiers", "un quart", "un huitième"],
        rot: 22, // hypoténuse diagonale → on incline pour briser l'axe 45°
    },
    {
        id: "tg2",
        label: "Triangle ②",
        pieceLabel: "triangle",
        color: "#EA580C",
        ghostC: "#FED7AA",
        active: "10,10 190,10 100,100",
        ghosts: [
            "190,10 190,190 100,100",
            "10,190 190,190 100,100",
            "10,10 10,190 100,100",
        ],
        n: 4,
        answer: "un quart",
        tout: "carré",
        fOpts: ["un demi", "un quart", "un sixième", "un huitième"],
        rot: 35, // base horizontale en haut → on tourne pour éviter "toit"
    },
    {
        id: "tg3",
        label: "Petit triangle ③",
        pieceLabel: "petit triangle",
        color: "#16A34A",
        ghostC: "#BBF7D0",
        active: "10,10 100,10 100,100",
        ghosts: [
            "10,10 10,100 100,100",
            "100,10 190,10 100,100",
            "190,10 190,100 100,100",
            "10,100 100,100 10,190",
            "100,100 100,190 10,190",
            "100,100 190,100 190,190",
            "100,100 100,190 190,190",
        ],
        n: 8,
        answer: "un huitième",
        tout: "carré",
        fOpts: ["un quart", "un sixième", "un huitième", "un demi"],
        rot: 50, // angle droit en haut-gauche → on tourne franchement
    },
    {
        id: "tg4",
        label: "Petit carré ④",
        pieceLabel: "petit carré",
        color: "#DB2777",
        ghostC: "#FBCFE8",
        active: "10,10 100,10 100,100 10,100",
        ghosts: [
            "100,10 190,10 190,100 100,100",
            "10,100 100,100 100,190 10,190",
            "100,100 190,100 190,190 100,190",
        ],
        n: 4,
        answer: "un quart",
        tout: "grand carré",
        fOpts: ["un demi", "un tiers", "un quart", "un huitième"],
        rot: 28, // côtés horizontaux/verticaux → on incline
    },
    {
        id: "tg5",
        label: "Rectangle ⑤",
        pieceLabel: "rectangle",
        color: "#0891B2", // cyan-600 — distinct des 4 autres situations
        ghostC: "#A5F3FC", // cyan-200
        //
        // Carré plié en deux horizontalement :
        //   moitié haute (active) : rectangle 180×90 en haut du carré
        //   moitié basse (ghost)  : rectangle 180×90 en bas
        //
        active: "10,10 190,10 190,100 10,100",
        ghosts: ["10,100 190,100 190,190 10,190"],
        n: 2,
        answer: "un demi",
        tout: "carré",
        //
        // Distracteurs : un tiers et un quart sont les confusions les plus
        // fréquentes à CE1 sur un rectangle (l'élève peut penser "3 bandes"
        // ou confondre avec le quart vu en tg2/tg4).
        //
        fOpts: ["un demi", "un tiers", "un quart", "un huitième"],
        //
        // Rotation du modèle affiché : on incline le rectangle pour éviter
        // l'orientation "bande horizontale" prototypique qui induirait l'élève
        // à compter des lignes plutôt qu'une surface.
        //
        rot: 25,
    },
];
