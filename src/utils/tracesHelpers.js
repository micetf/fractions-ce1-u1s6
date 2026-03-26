/**
 * @file tracesHelpers.js — fonctions pures de gestion des traces de parcours.
 *
 * @description
 * Toutes les opérations de lecture/écriture sur la structure `TracesStore`
 * sans aucune dépendance React.
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
 * @module tracesHelpers
 */

import { STORAGE_KEYS, readStorage, writeStorage } from "./storage.js";

// ─── Typedefs ──────────────────────────────────────────────────────────────────

/**
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
 * @typedef {Object} Session
 * @property {string}               sessionId
 * @property {string}               openedAt   - ISO 8601
 * @property {boolean}              completed
 * @property {SituationSnapshot[]}  situations
 */

/** @typedef {Object.<string, Object.<string, Session>>} TracesStore */

// ─── Lecture / Écriture ────────────────────────────────────────────────────────

/** @returns {TracesStore} */
export const readTraces = () => readStorage(STORAGE_KEYS.TRACES, {});

/** @param {TracesStore} traces @returns {boolean} */
export const writeTraces = (traces) =>
    writeStorage(STORAGE_KEYS.TRACES, traces);

// ─── Accès ciblé ───────────────────────────────────────────────────────────────

/**
 * @param {TracesStore} traces
 * @param {string} atelierID
 * @param {string} studentId
 * @returns {Session|null}
 */
export const getSession = (traces, atelierID, studentId) =>
    traces?.[atelierID]?.[studentId] ?? null;

// ─── Mutations immutables ──────────────────────────────────────────────────────

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
 * Supprime la session d'un élève pour un atelier donné.
 */
export const deleteSession = (traces, atelierID, studentId) => {
    const atelier = { ...traces[atelierID] };
    delete atelier[studentId];
    return { ...traces, [atelierID]: atelier };
};

/**
 * Supprime toutes les sessions d'un élève sur TOUS les ateliers.
 * Cas d'usage : reset complet d'un élève (départ, erreur de manipulation).
 *
 * @param {TracesStore} traces
 * @param {string}      studentId
 * @returns {TracesStore}
 */
export const deleteStudentAllAteliers = (traces, studentId) =>
    Object.fromEntries(
        Object.entries(traces).map(([atelierID, atelierData]) => {
            const copy = { ...atelierData };
            delete copy[studentId];
            return [atelierID, copy];
        })
    );

/**
 * Supprime toutes les sessions de tous les élèves sur un atelier.
 */
export const deleteAtelier = (traces, atelierID) => {
    const next = { ...traces };
    delete next[atelierID];
    return next;
};
