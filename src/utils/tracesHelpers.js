/**
 * @file tracesHelpers.js — fonctions pures de gestion des traces de parcours.
 *
 * @description
 * Toutes les opérations de lecture/écriture sur la structure `TracesStore`
 * sans aucune dépendance React. Permet de tester la logique indépendamment
 * du cycle de vie des composants.
 *
 * Structure persistée sous `fce1u1s6_traces` :
 * ```
 * {
 *   [atelierID: 'tg'|'dq'|'cu']: {
 *     [studentId: string]: Session
 *   }
 * }
 * ```
 *
 * Une seule session est conservée par élève par atelier (la plus récente).
 * Les sessions partielles (sans ATELIER_DONE) sont incluses.
 *
 * @module tracesHelpers
 */

import { STORAGE_KEYS, readStorage, writeStorage } from "./storage.js";

// ─── Typedefs ──────────────────────────────────────────────────────────────────

/**
 * Instantané d'une situation terminée ou en cours.
 * Correspond au sous-ensemble de SituationStats persistable.
 *
 * @typedef {Object} SituationSnapshot
 * @property {number}                   idx
 * @property {string}                   id
 * @property {string}                   label
 * @property {'perfect'|'good'|'struggled'|'active'} status
 * @property {boolean|null}             predictCorrect
 * @property {number}                   countErrors
 * @property {number}                   nameErrors
 * @property {number|null}              durationMs
 * @property {boolean}                  fullScore
 * @property {Array<{chosen:string, answer:string}>} distractors
 */

/**
 * Session de parcours d'un élève sur un atelier.
 *
 * @typedef {Object} Session
 * @property {string}               sessionId  - UUID v4
 * @property {string}               openedAt   - ISO 8601
 * @property {boolean}              completed  - true après ATELIER_DONE
 * @property {SituationSnapshot[]}  situations - situations triées par idx
 */

/**
 * Structure complète du store de traces.
 *
 * @typedef {Object.<string, Object.<string, Session>>} TracesStore
 */

// ─── Lecture / Écriture ────────────────────────────────────────────────────────

/**
 * Lit le store complet depuis localStorage.
 *
 * @returns {TracesStore}
 */
export const readTraces = () => readStorage(STORAGE_KEYS.TRACES, {});

/**
 * Persiste le store complet dans localStorage.
 *
 * @param {TracesStore} traces
 * @returns {boolean}
 */
export const writeTraces = (traces) =>
    writeStorage(STORAGE_KEYS.TRACES, traces);

// ─── Accès ciblé ───────────────────────────────────────────────────────────────

/**
 * Retourne la session d'un élève pour un atelier donné.
 *
 * @param {TracesStore} traces
 * @param {string}      atelierID
 * @param {string}      studentId
 * @returns {Session|null}
 */
export const getSession = (traces, atelierID, studentId) =>
    traces?.[atelierID]?.[studentId] ?? null;

// ─── Mutations (retournent un nouveau store — immutabilité) ────────────────────

/**
 * Crée ou remplace la session d'un élève (ouverture d'atelier).
 *
 * @param {TracesStore} traces
 * @param {string}      atelierID
 * @param {string}      studentId
 * @returns {TracesStore}
 */
export const openSession = (traces, atelierID, studentId) => ({
    ...traces,
    [atelierID]: {
        ...traces[atelierID],
        [studentId]: {
            sessionId: crypto.randomUUID(),
            openedAt: new Date().toISOString(),
            completed: false,
            situations: [],
        },
    },
});

/**
 * Insère ou met à jour une situation dans la session active (upsert par idx).
 * Sans effet si aucune session n'est ouverte pour cet élève.
 *
 * @param {TracesStore}      traces
 * @param {string}           atelierID
 * @param {string}           studentId
 * @param {SituationSnapshot} snap
 * @returns {TracesStore}
 */
export const appendSituation = (traces, atelierID, studentId, snap) => {
    const session = getSession(traces, atelierID, studentId);
    if (!session) return traces;

    const existing = session.situations.filter((s) => s.idx !== snap.idx);
    const updated = [...existing, snap].sort((a, b) => a.idx - b.idx);

    return {
        ...traces,
        [atelierID]: {
            ...traces[atelierID],
            [studentId]: { ...session, situations: updated },
        },
    };
};

/**
 * Marque une session comme terminée (après ATELIER_DONE).
 *
 * @param {TracesStore} traces
 * @param {string}      atelierID
 * @param {string}      studentId
 * @returns {TracesStore}
 */
export const markCompleted = (traces, atelierID, studentId) => {
    const session = getSession(traces, atelierID, studentId);
    if (!session) return traces;
    return {
        ...traces,
        [atelierID]: {
            ...traces[atelierID],
            [studentId]: { ...session, completed: true },
        },
    };
};

/**
 * Supprime la session d'un élève pour un atelier.
 *
 * @param {TracesStore} traces
 * @param {string}      atelierID
 * @param {string}      studentId
 * @returns {TracesStore}
 */
export const deleteSession = (traces, atelierID, studentId) => {
    const atelier = { ...traces[atelierID] };
    delete atelier[studentId];
    return { ...traces, [atelierID]: atelier };
};

/**
 * Supprime toutes les sessions d'un atelier (reset atelier).
 *
 * @param {TracesStore} traces
 * @param {string}      atelierID
 * @returns {TracesStore}
 */
export const deleteAtelier = (traces, atelierID) => {
    const next = { ...traces };
    delete next[atelierID];
    return next;
};
