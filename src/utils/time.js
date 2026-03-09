/**
 * @file Utilitaires de formatage temporel.
 * Fonctions pures sans état ni effets de bord.
 */

/**
 * Convertit une durée en millisecondes en chaîne lisible par l'enseignant·e.
 * Format court : "45s" ou "1m23s".
 *
 * @param {number|null|undefined} ms - Durée en millisecondes
 * @returns {string} Durée formatée, ou "—" si la valeur est absente
 *
 * @example
 * fmtMs(45000)  // => "45s"
 * fmtMs(83000)  // => "1m23s"
 * fmtMs(null)   // => "—"
 */
export function fmtMs(ms) {
    if (!ms && ms !== 0) return "—";
    const s = Math.round(ms / 1000);
    return s < 60
        ? `${s}s`
        : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s`;
}
