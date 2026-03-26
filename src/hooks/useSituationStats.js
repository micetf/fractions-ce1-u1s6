/**
 * @file useSituationStats — hook de dérivation des statistiques pédagogiques.
 *
 * @description
 * Parcourt le journal d'événements une seule fois (via `useMemo`) pour
 * construire le tableau de statistiques par situation et les distracteurs
 * agrégés. Aucun état dupliqué — tout est dérivé des `events`.
 *
 * ────────────────────────────────────────────────────────────────
 * Déplacement (refactoring niveau 1)
 * ────────────────────────────────────────────────────────────────
 * Fichier précédemment situé dans `components/dashboard/useSituationStats.js`.
 * Déplacé ici car les hooks React (`use*`) doivent résider dans `hooks/`
 * par convention et pour la maintenabilité.
 * Seul import à mettre à jour : `Dashboard.jsx` → `../../hooks/useSituationStats.js`
 *
 * ────────────────────────────────────────────────────────────────
 * Événements traités
 * ────────────────────────────────────────────────────────────────
 * - SIT_START  : initialise l'entrée dans le map
 * - PREDICT    : enregistre predictCorrect depuis data
 * - COUNT_ERR  : incrémente countErrors
 * - NAME_ERR   : incrémente nameErrors + collecte distracteur
 * - SIT_DONE   : finalise le statut et la durée
 *
 * ────────────────────────────────────────────────────────────────
 * Statuts d'une situation terminée
 * ────────────────────────────────────────────────────────────────
 * - perfect   → fullScore === true
 * - good      → nameErrors ≤ 2
 * - struggled → nameErrors > 2
 *
 * ────────────────────────────────────────────────────────────────
 * Note sur predictCorrect
 * ────────────────────────────────────────────────────────────────
 * La valeur est lue depuis SIT_DONE (data.predictCorrect) :
 * - true  : prédiction correcte
 * - false : prédiction incorrecte
 * - null  : situation nonUnit (pas de phase predict) ou absent
 *
 * @module useSituationStats
 */

import { useMemo } from "react";

// ─── Typedef ───────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} SituationStats
 * @property {number}            idx
 * @property {string}            id
 * @property {string}            label
 * @property {'active'|'perfect'|'good'|'struggled'} status
 * @property {boolean|null}      predictCorrect  - null si nonUnit ou absent
 * @property {number}            countErrors
 * @property {number}            nameErrors
 * @property {number|null}       durationMs
 * @property {boolean}           fullScore
 * @property {Array<{chosen:string, answer:string}>} distractors
 */

/**
 * @typedef {Object} Distractor
 * @property {string} chosen
 * @property {string} answer
 * @property {number} count
 */

/**
 * @typedef {Object} UseSituationStatsReturn
 * @property {SituationStats[]} sits           - Toutes les situations (actives + terminées)
 * @property {SituationStats[]} done           - Situations terminées uniquement
 * @property {SituationStats|undefined} current - Situation active (undefined si aucune)
 * @property {Distractor[]}     allDistractors - Distracteurs agrégés, triés par fréquence
 * @property {number}           firstTryPct    - Taux de réussite premier essai (0–100)
 * @property {number|null}      avgDur         - Durée moyenne par situation (ms) | null
 */

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Dérive toutes les statistiques du tableau de bord depuis le journal d'événements.
 *
 * @param {Array<{type:string, data:Object, t:number}>} events - Journal complet
 * @returns {UseSituationStatsReturn}
 */
export function useSituationStats(events) {
    // ── Dérivation des situations ────────────────────────────────────────────────

    /** @type {SituationStats[]} */
    const sits = useMemo(() => {
        /** @type {Object.<number, SituationStats>} */
        const map = {};

        events.forEach(({ type, data }) => {
            // Initialisation à la première rencontre d'un idx
            if (type === "SIT_START") {
                map[data.idx] = {
                    ...data,
                    status: "active",
                    predictCorrect: null,
                    countErrors: 0,
                    nameErrors: 0,
                    durationMs: null,
                    fullScore: false,
                    distractors: [],
                };
            }

            // Garde-fou : ignorer les événements sans situation initialisée
            if (!map[data.idx]) return;

            if (type === "COUNT_ERR") {
                map[data.idx].countErrors =
                    (map[data.idx].countErrors || 0) + 1;
            }

            if (type === "NAME_ERR") {
                map[data.idx].nameErrors = (map[data.idx].nameErrors || 0) + 1;
                map[data.idx].distractors.push({
                    chosen: data.chosen,
                    answer: data.answer,
                });
            }

            if (type === "SIT_DONE") {
                const nameErrors = map[data.idx].nameErrors || 0;

                Object.assign(map[data.idx], {
                    predictCorrect: data.predictCorrect ?? null,
                    durationMs: data.durationMs,
                    fullScore: data.fullScore,
                    status: data.fullScore
                        ? "perfect"
                        : nameErrors <= 2
                          ? "good"
                          : "struggled",
                });
            }
        });

        return Object.values(map).sort((a, b) => a.idx - b.idx);
    }, [events]);

    // ── Dérivations secondaires ──────────────────────────────────────────────────

    const done = sits.filter((s) => s.status !== "active");
    const current = sits.find((s) => s.status === "active");

    const avgDur =
        done.length > 0
            ? done.reduce((sum, x) => sum + (x.durationMs || 0), 0) /
              done.length
            : null;

    const firstTryPredict = done.filter(
        (s) => s.predictCorrect === true
    ).length;
    const firstTryName = done.filter((s) => s.nameErrors === 0).length;

    /*
     * Taux 1er essai : prédiction correcte + nommage correct au premier essai.
     * Les situations nonUnit (predictCorrect === null) ne comptent pas pour
     * la prédiction mais comptent pour le nommage.
     * Base de calcul : nombre de situations avec predict + nombre total pour name.
     */
    const predictableSits = done.filter(
        (s) => s.predictCorrect !== null
    ).length;
    const totalPossible = predictableSits + done.length;

    const firstTryPct =
        totalPossible > 0
            ? Math.round(
                  ((firstTryPredict + firstTryName) / totalPossible) * 100
              )
            : 0;

    // ── Distracteurs agrégés ─────────────────────────────────────────────────────

    /** @type {Distractor[]} */
    const allDistractors = useMemo(() => {
        /** @type {Object.<string, Distractor>} */
        const acc = {};
        sits.forEach((s) =>
            (s.distractors || []).forEach(({ chosen, answer }) => {
                const k = `${chosen}||${answer}`;
                if (!acc[k]) acc[k] = { chosen, answer, count: 0 };
                acc[k].count++;
            })
        );
        return Object.values(acc).sort((a, b) => b.count - a.count);
    }, [sits]);

    return {
        sits,
        done,
        current,
        allDistractors,
        firstTryPct,
        avgDur,
    };
}
