/**
 * @file storage.js — constantes de clés et helpers de stockage.
 *
 * @description
 * Centralise les clés de stockage et les opérations read/write pour éviter
 * toute duplication entre les hooks. Le préfixe `fce1u1s6_` garantit
 * l'absence de collision avec d'autres applications sur le même domaine.
 *
 * Tout le stockage repose sur `localStorage` (pas de sessionStorage) :
 * - roster et traces  → persistance longue durée
 * - session active    → survit au rechargement ET à la fermeture de l'onglet
 *
 * L'accès enseignant (`teacherAuthed`) n'est jamais écrit ici : il reste
 * en état React uniquement et est révoqué à chaque rechargement.
 *
 * @module storage
 */

// ─── Clés ──────────────────────────────────────────────────────────────────────

/**
 * Clés de stockage localStorage de l'application.
 *
 * @enum {string}
 */
export const STORAGE_KEYS = {
    /** Liste des élèves de la classe. @see useRoster */
    ROSTER: "fce1u1s6_roster",
    /** Traces de parcours par atelier et par élève. @see useStudentTraces */
    TRACES: "fce1u1s6_traces",
    /**
     * Session active lancée par l'enseignant.
     * Structure : {@link ActiveSession}
     * Persiste à la fermeture de l'onglet — effacé uniquement par handleStopSession.
     */
    SESSION: "fce1u1s6_session",
};

// ─── Typedef ───────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ActiveSession
 * @property {boolean}     active          - Session ouverte aux élèves
 * @property {string|null} atelierID       - Identifiant de l'atelier en cours
 * @property {string|null} activeStudentId - ID de l'élève courant
 *                                           (déviation assumée des specs : persisté
 *                                           pour permettre la reprise après reload)
 * @property {number|null} startTs         - Timestamp de début de session élève (ms)
 */

/** @type {ActiveSession} */
const SESSION_DEFAULT = {
    active: false,
    atelierID: null,
    activeStudentId: null,
    startTs: null,
};

// ─── Helpers génériques localStorage ──────────────────────────────────────────

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
 * Silencieux en cas d'erreur (quota dépassé, navigation privée).
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

// ─── Helpers sémantiques SESSION ───────────────────────────────────────────────

/**
 * Lit la session active depuis localStorage.
 * Fusionne avec `SESSION_DEFAULT` pour garantir la présence de tous les champs
 * même si la structure stockée est incomplète (migration de schéma).
 *
 * @returns {ActiveSession}
 */
export function readActiveSession() {
    return {
        ...SESSION_DEFAULT,
        ...readStorage(STORAGE_KEYS.SESSION, SESSION_DEFAULT),
    };
}

/**
 * Applique un patch partiel sur la session active et persiste le résultat.
 * Pattern read-before-write : relit localStorage pour éviter les collisions.
 *
 * @param {Partial<ActiveSession>} patch
 * @returns {boolean}
 */
export function writeActiveSession(patch) {
    const current = readActiveSession();
    return writeStorage(STORAGE_KEYS.SESSION, { ...current, ...patch });
}

/**
 * Réinitialise complètement la session active.
 * Appelé par handleStopSession uniquement.
 *
 * @returns {boolean}
 */
export function clearSession() {
    return writeStorage(STORAGE_KEYS.SESSION, SESSION_DEFAULT);
}
