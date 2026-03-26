/**
 * @file useStudentTraces.js — gestion des traces de parcours élèves.
 *
 * @description
 * Couche React mince sur `tracesHelpers`. Maintient le store en état React
 * (pour déclencher les re-rendus) et le persiste en localStorage de façon
 * synchrone à chaque mutation.
 *
 * Toutes les fonctions exposées effectuent un pattern
 * lecture-avant-écriture pour la sécurité multi-onglets.
 *
 * @module useStudentTraces
 */

import { useState, useCallback } from "react";
import {
    readTraces,
    writeTraces,
    getSession as _getSession,
    openSession as _openSession,
    appendSituation as _appendSituation,
    markCompleted as _markCompleted,
    deleteSession as _deleteSession,
    deleteAtelier as _deleteAtelier,
} from "../utils/tracesHelpers.js";
import { removeStorage, STORAGE_KEYS } from "../utils/storage.js";

// ─── Typedef ───────────────────────────────────────────────────────────────────

/**
 * @typedef {import('../utils/tracesHelpers.js').Session}           Session
 * @typedef {import('../utils/tracesHelpers.js').SituationSnapshot} SituationSnapshot
 * @typedef {import('../utils/tracesHelpers.js').TracesStore}       TracesStore
 */

/**
 * @typedef {Object} UseStudentTracesReturn
 * @property {TracesStore} traces
 * @property {Function} openSession      (atelierID, studentId) → void
 * @property {Function} appendSituation  (atelierID, studentId, snap) → void
 * @property {Function} markCompleted    (atelierID, studentId) → void
 * @property {Function} getSession       (atelierID, studentId) → Session|null
 * @property {Function} resetStudent     (atelierID, studentId) → void
 * @property {Function} resetAtelier     (atelierID) → void
 * @property {Function} resetAll         () → void
 */

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Gestion des traces de parcours élèves persistées dans localStorage.
 *
 * @returns {UseStudentTracesReturn}
 *
 * @example
 * const { openSession, appendSituation, getSession } = useStudentTraces();
 *
 * // Ouverture de session à la sélection de l'élève
 * openSession('tg', student.id);
 *
 * // Persistance incrémentale sur SIT_DONE
 * appendSituation('tg', student.id, situationSnapshot);
 *
 * // Lecture dans le Dashboard
 * const session = getSession('tg', student.id);
 */
export function useStudentTraces() {
    const [traces, setTraces] = useState(() => readTraces());

    /**
     * Applique une transformation pure sur le store,
     * persiste et met à jour l'état React.
     *
     * @param {function(TracesStore): TracesStore} transform
     */
    const commit = useCallback((transform) => {
        // Relecture pour merger en cas de multi-onglets
        const fresh = readTraces();
        const next = transform(fresh);
        writeTraces(next);
        setTraces(next);
    }, []);

    const openSession = useCallback(
        (atelierID, studentId) =>
            commit((t) => _openSession(t, atelierID, studentId)),
        [commit]
    );

    const appendSituation = useCallback(
        (atelierID, studentId, snap) =>
            commit((t) => _appendSituation(t, atelierID, studentId, snap)),
        [commit]
    );

    const markCompleted = useCallback(
        (atelierID, studentId) =>
            commit((t) => _markCompleted(t, atelierID, studentId)),
        [commit]
    );

    /** Lecture directe depuis l'état React (pas de relecture localStorage). */
    const getSession = useCallback(
        (atelierID, studentId) => _getSession(traces, atelierID, studentId),
        [traces]
    );

    const resetStudent = useCallback(
        (atelierID, studentId) =>
            commit((t) => _deleteSession(t, atelierID, studentId)),
        [commit]
    );

    const resetAtelier = useCallback(
        (atelierID) => commit((t) => _deleteAtelier(t, atelierID)),
        [commit]
    );

    const resetAll = useCallback(() => {
        removeStorage(STORAGE_KEYS.TRACES);
        setTraces({});
    }, []);

    return {
        traces,
        openSession,
        appendSituation,
        markCompleted,
        getSession,
        resetStudent,
        resetAtelier,
        resetAll,
    };
}
