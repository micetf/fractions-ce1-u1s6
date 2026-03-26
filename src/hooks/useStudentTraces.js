/**
 * @file useStudentTraces.js — gestion des traces de parcours élèves.
 *
 * @description
 * Couche React mince sur `tracesHelpers`. Maintient le store en état React
 * et le persiste en localStorage à chaque mutation (pattern commit).
 *
 * API de réinitialisation :
 * - resetStudent(atelierID, studentId) — élève / atelier courant
 * - resetStudentAll(studentId)         — élève / tous les ateliers
 * - resetAll()                         — tout supprimer
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
    deleteStudentAllAteliers as _deleteStudentAllAteliers,
} from "../utils/tracesHelpers.js";
import { removeStorage, STORAGE_KEYS } from "../utils/storage.js";

/**
 * @typedef {import('../utils/tracesHelpers.js').Session}           Session
 * @typedef {import('../utils/tracesHelpers.js').SituationSnapshot} SituationSnapshot
 * @typedef {import('../utils/tracesHelpers.js').TracesStore}       TracesStore
 */

export function useStudentTraces() {
    const [traces, setTraces] = useState(() => readTraces());

    /**
     * Pattern lecture-avant-écriture : relit localStorage pour merger
     * en cas de multi-onglets, applique la transformation, persiste.
     *
     * @param {function(TracesStore): TracesStore} transform
     */
    const commit = useCallback((transform) => {
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

    const getSession = useCallback(
        (atelierID, studentId) => _getSession(traces, atelierID, studentId),
        [traces]
    );

    /** Réinitialise un élève sur l'atelier courant uniquement. */
    const resetStudent = useCallback(
        (atelierID, studentId) =>
            commit((t) => _deleteSession(t, atelierID, studentId)),
        [commit]
    );

    /** Réinitialise un élève sur tous les ateliers. */
    const resetStudentAll = useCallback(
        (studentId) => commit((t) => _deleteStudentAllAteliers(t, studentId)),
        [commit]
    );

    /** Supprime toutes les traces de tous les élèves. */
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
        resetStudentAll,
        resetAll,
    };
}
