/**
 * @file uuid.js — génération d'identifiants UUID v4.
 *
 * @description
 * `crypto.randomUUID()` est restreinte aux contextes sécurisés (HTTPS).
 * Sur un réseau interne d'école servi en HTTP, elle lève une `TypeError`.
 *
 * Ce module expose `generateUUID()` qui :
 * 1. Utilise `crypto.randomUUID()` si le contexte est sécurisé (HTTPS,
 *    localhost) — chemin optimal, conforme RFC 4122.
 * 2. Sinon, construit un UUID v4 via `crypto.getRandomValues()`, disponible
 *    en HTTP — même entropie, même format, même conformité RFC 4122.
 *
 * `crypto.getRandomValues` est spécifiée par le W3C comme disponible dans
 * tous les contextes (pas de restriction HTTPS), ce qui en fait le seul
 * fallback fiable sans dépendance externe.
 *
 * @module uuid
 */

/**
 * Génère un UUID v4 conforme RFC 4122, quel que soit le contexte HTTP/HTTPS.
 *
 * @returns {string} UUID v4 au format `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
 *
 * @example
 * generateUUID(); // → "3b12f1df-5232-4804-897e-917bf397618a"
 */
export function generateUUID() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function" &&
        window.isSecureContext
    ) {
        return crypto.randomUUID();
    }

    // Fallback : UUID v4 via getRandomValues (disponible en HTTP)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
