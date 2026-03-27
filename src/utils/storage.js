/**
 * @file storage.js — constantes de clés et helpers de stockage.
 *
 * @description
 * Centralise les clés de stockage et les opérations read/write pour éviter
 * toute duplication entre les hooks. Le préfixe `fce1u1s6_` garantit
 * l'absence de collision avec d'autres applications sur le même domaine.
 *
 * Deux backends :
 * - `localStorage`   — données persistantes (roster, traces)
 * - `sessionStorage` — données volatiles liées à l'onglet (session active)
 *
 * Pattern lecture-avant-écriture : chaque `write` relit d'abord la clé
 * pour merger les données (sécurité multi-onglets).
 *
 * @module storage
 */

// ─── Clés ──────────────────────────────────────────────────────────────────────

/**
 * Clés de stockage de l'application.
 *
 * - `ROSTER`  → localStorage  (@see useRoster)
 * - `TRACES`  → localStorage  (@see useStudentTraces)
 * - `SESSION` → sessionStorage — atelier lancé par l'enseignant.
 *               Survivant au refresh de la page, effacé à la fermeture de l'onglet.
 *
 * @enum {string}
 */
export const STORAGE_KEYS = {
    ROSTER: "fce1u1s6_roster",
    TRACES: "fce1u1s6_traces",
    SESSION: "fce1u1s6_session",
};

// ─── Helpers localStorage ──────────────────────────────────────────────────────

/**
 * Lit et désérialise une valeur depuis localStorage.
 *
 * @template T
 * @param {string} key          - Clé localStorage
 * @param {T}      defaultValue - Valeur renvoyée si absente ou corrompue
 * @returns {T}
 */
export function readStorage(key, defaultValue) {
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
        return defaultValue;
    }
}

/**
 * Sérialise et écrit une valeur dans localStorage.
 *
 * @param {string}  key   - Clé localStorage
 * @param {unknown} value - Valeur JSON-sérialisable
 * @returns {boolean} `true` si l'écriture a réussi
 */
export function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

/**
 * Supprime une clé de localStorage.
 *
 * @param {string} key
 */
export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // silencieux
    }
}

// ─── Helpers sessionStorage ────────────────────────────────────────────────────

/**
 * Lit et désérialise une valeur depuis sessionStorage.
 *
 * @template T
 * @param {string} key          - Clé sessionStorage
 * @param {T}      defaultValue - Valeur renvoyée si absente ou corrompue
 * @returns {T}
 */
export function readSession(key, defaultValue) {
    try {
        const raw = sessionStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
        return defaultValue;
    }
}

/**
 * Sérialise et écrit une valeur dans sessionStorage.
 *
 * @param {string}  key   - Clé sessionStorage
 * @param {unknown} value - Valeur JSON-sérialisable
 * @returns {boolean} `true` si l'écriture a réussi
 */
export function writeSession(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

/**
 * Supprime une clé de sessionStorage.
 *
 * @param {string} key
 */
export function removeSession(key) {
    try {
        sessionStorage.removeItem(key);
    } catch {
        // silencieux
    }
}
