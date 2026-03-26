/**
 * @file useSessionStats.js — statistiques de bilan depuis une Session persistée.
 *
 * @description
 * Miroir de `useSituationStats` mais opère sur un objet `Session` (localStorage)
 * plutôt que sur un journal d'événements en mémoire.
 *
 * Les `SituationSnapshot` sont déjà entièrement calculés à la persistance :
 * ce hook se contente d'agréger les données inter-situations.
 *
 * Différences avec useSituationStats :
 * - Pas de `current` (toutes les situations persistées sont terminées)
 * - Pas de traitement d'événements — lecture directe des snapshots
 * - Formule firstTryPct identique
 *
 * @module useSessionStats
 */

import { useMemo } from "react";

/**
 * @typedef {import('../utils/tracesHelpers.js').Session}           Session
 * @typedef {import('../utils/tracesHelpers.js').SituationSnapshot} SituationSnapshot
 */

/**
 * @typedef {Object} UseSessionStatsReturn
 * @property {SituationSnapshot[]} sits           - Situations triées par idx
 * @property {SituationSnapshot[]} done           - Alias de sits (toutes terminées)
 * @property {Array}               allDistractors - Distracteurs agrégés par fréquence
 * @property {number}              firstTryPct    - Taux 1er essai (0–100)
 * @property {number|null}         avgDur         - Durée moyenne par situation (ms)
 */

/**
 * Dérive les statistiques de bilan depuis une Session persistée.
 *
 * @param {Session|null} session
 * @returns {UseSessionStatsReturn}
 */
export function useSessionStats(session) {
    return useMemo(() => {
        const empty = {
            sits: [],
            done: [],
            allDistractors: [],
            firstTryPct: 0,
            avgDur: null,
        };
        if (!session || session.situations.length === 0) return empty;

        const sits = [...session.situations].sort((a, b) => a.idx - b.idx);

        // ── Distracteurs agrégés ─────────────────────────────────────────────
        const acc = {};
        sits.forEach((s) =>
            (s.distractors || []).forEach(({ chosen, answer }) => {
                const k = `${chosen}||${answer}`;
                if (!acc[k]) acc[k] = { chosen, answer, count: 0 };
                acc[k].count++;
            })
        );
        const allDistractors = Object.values(acc).sort(
            (a, b) => b.count - a.count
        );

        // ── Taux 1er essai (formule identique à useSituationStats) ───────────
        const firstTryPredict = sits.filter(
            (s) => s.predictCorrect === true
        ).length;
        const firstTryName = sits.filter((s) => s.nameErrors === 0).length;
        const predictable = sits.filter(
            (s) => s.predictCorrect !== null
        ).length;
        const totalPossible = predictable + sits.length;
        const firstTryPct =
            totalPossible > 0
                ? Math.round(
                      ((firstTryPredict + firstTryName) / totalPossible) * 100
                  )
                : 0;

        // ── Durée moyenne ────────────────────────────────────────────────────
        const avgDur =
            sits.length > 0
                ? sits.reduce((sum, s) => sum + (s.durationMs || 0), 0) /
                  sits.length
                : null;

        return { sits, done: sits, allDistractors, firstTryPct, avgDur };
    }, [session]);
}
