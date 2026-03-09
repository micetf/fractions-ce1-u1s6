/**
 * @file Messages de feedback procéduraux selon le modèle A. Tricot.
 *
 * @description
 * Toutes les fonctions sont pures : elles reçoivent des paramètres
 * et retournent une chaîne de caractères. Aucun état React ici.
 *
 * Principes appliqués (enseignement explicite) :
 * - Le feedback guide vers la procédure, pas vers la réponse directe.
 * - Erreur 1 → on rappelle le contexte numérique (combien ?).
 * - Erreur 2 → on énonce la règle de nommage.
 *
 * Types d'événements couverts :
 * @see {okCountMsg}   – Comptage correct
 * @see {okNameMsg}    – Nommage correct
 * @see {errCountFew}  – Pas assez de pièces posées
 * @see {errCountMany} – Trop de pièces posées
 * @see {errName1}     – 1ère erreur de nommage
 * @see {errName2}     – 2ème erreur de nommage (+ règle)
 * @see {ruleMsg}      – Règle explicite selon n
 */

/**
 * Table de correspondance nombre de parts → nom de la fraction.
 * @type {Object.<number, string>}
 */
export const FNAME = {
    2: "un demi",
    3: "un tiers",
    4: "un quart",
    5: "un cinquième",
    6: "un sixième",
    8: "un huitième",
    9: "un neuvième",
    10: "un dixième",
};

/**
 * Énonce la règle de nommage selon le nombre de parts égales.
 *
 * @param {number} n - Nombre de parts
 * @returns {string}
 */
export function ruleMsg(n) {
    if (n === 2)
        return "Quand il faut 2 parts égales pour faire le tout, on dit «un demi».";
    if (n === 3) return "Quand il faut 3 parts égales, on dit «un tiers».";
    if (n === 4) return "Quand il faut 4 parts égales, on dit «un quart».";
    return `Quand il faut ${n} parts égales, on dit «un ${n}-ième».`;
}

/**
 * Feedback positif après un comptage réussi.
 *
 * @param {number} n   - Nombre de pièces
 * @param {string} p   - Nom de la pièce (singulier)
 * @param {string} t   - Nom du tout
 * @returns {string}
 */
export const okCountMsg = (n, p, t) => {
    const pluriel = (s) => {
        return s
            .split(" ")
            .map((t) => t + "s")
            .join(" ");
    };
    const genre = (s) => {
        return s.includes("carré") || s.includes("disque") ? "le" : "la";
    };
    return `Il faut bien ${n} ${n > 1 ? pluriel(p) : p} pour remplir ${genre(t)} ${t}. Maintenant, nomme la fraction.`;
};

/**
 * Feedback positif après un nommage réussi.
 *
 * @param {number} n   - Nombre de pièces
 * @param {string} p   - Nom de la pièce
 * @param {string} t   - Nom du tout
 * @param {string} f   - Nom de la fraction attendue
 * @returns {string}
 */
export const okNameMsg = (n, p, t, f) => {
    const pluriel = (s) => {
        return s
            .split(" ")
            .map((t) => t + "s")
            .join(" ");
    };
    const genre = (s) => {
        return s.includes("carré") || s.includes("disque") ? "le" : "la";
    };
    return `Il faut ${n} ${n > 1 ? pluriel(p) : p} pour faire ${genre(t)} ${t} → c'est «${f}».`;
};

/**
 * Feedback d'erreur : pas assez de pièces placées.
 *
 * @param {number} placed - Nombre placé par l'élève
 * @param {number} n      - Nombre attendu
 * @returns {string}
 */
export const errCountFew = (placed, n) =>
    `Il reste de la place. Tu en as ${placed}, il en faut ${n}. Continue à en ajouter.`;

/**
 * Feedback d'erreur : trop de pièces placées.
 *
 * @param {number} placed - Nombre placé par l'élève
 * @param {number} n      - Nombre attendu
 * @returns {string}
 */
export const errCountMany = (placed, n) =>
    `Tu en as ${placed} mais le tout ne peut en contenir que ${n}. Retire-en.`;

/**
 * Première erreur de nommage — rappel du contexte numérique.
 *
 * @param {number} n - Nombre de pièces
 * @param {string} p - Nom de la pièce (pluriel)
 * @returns {string}
 */
export const errName1 = (n, p) =>
    `Tu as compté ${n} ${p}. Quelle fraction contient le nombre ${n} ?`;

/**
 * Deuxième erreur de nommage — énonce la règle explicitement.
 *
 * @param {number} n - Nombre de parts
 * @returns {string}
 */
export const errName2 = (n) => ruleMsg(n);
