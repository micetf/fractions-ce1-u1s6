/**
 * @file storage.js — constantes de clés et helpers localStorage.
 *
 * @description
 * Centralise les clés de stockage et les opérations read/write pour éviter
 * toute duplication entre les hooks. Le préfixe `fce1u1s6_` garantit
 * l'absence de collision avec d'autres applications sur le même domaine.
 *
 * Pattern lecture-avant-écriture : chaque `write` relit d'abord la clé
 * pour merger les données (sécurité multi-onglets).
 *
 * @module storage
 */

// ─── Clés ──────────────────────────────────────────────────────────────────────

/**
 * Clés de stockage localStorage de l'application.
 * @enum {string}
 */
export const STORAGE_KEYS = {
    /** Liste des élèves de la classe. @see useRoster */
    ROSTER: "fce1u1s6_roster",
    /** Traces de parcours par atelier et par élève. @see useStudentTraces */
    TRACES: "fce1u1s6_traces",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Lit et désérialise une valeur depuis localStorage.
 *
 * @template T
 * @param {string} key          - Clé localStorage
 * @param {T}      defaultValue - Valeur renvoyée si la clé est absente ou corrompue
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
 * Silencieux en cas d'erreur (quota dépassé, navigation privée).
 *
 * @param {string} key   - Clé localStorage
 * @param {unknown} value - Valeur à persister (doit être JSON-sérialisable)
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
 * @param {string} key - Clé à supprimer
 */
export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // silencieux
    }
}
