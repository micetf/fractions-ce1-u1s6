/**
 * @file Hook d'encapsulation du journal d'événements pédagogiques.
 *
 * @description
 * Centralise la logique de logging pour éviter la duplication
 * dans chaque composant atelier. Retourne un triplet :
 * - `events`   : tableau immuable de tous les événements horodatés
 * - `log`      : fonction stable (useCallback) pour émettre un événement
 * - `resetLog` : vide le journal (changement d'atelier)
 *
 * Types d'événements supportés (contractuels) :
 *
 * | Type          | Données caractéristiques                              |
 * |---------------|-------------------------------------------------------|
 * | SIT_START     | { idx, id, label }                                    |
 * | PREDICT       | { idx, predicted, actual, correct }                   |
 * | COUNT_ERR     | { idx, placed, expected }                             |
 * | COUNT_OK      | { idx, countErrors }                                  |
 * | NAME_ERR      | { idx, chosen, answer, errN }                         |
 * | NAME_OK       | { idx, nameErrors }                                   |
 * | HINT_USED     | { idx }                                               |
 * | SIT_DONE      | { idx, label, n, answer, predictCorrect,              |
 * |               |   countErrors, nameErrors, durationMs,                |
 * |               |   hintUsed?, fullScore }                              |
 * | ATELIER_DONE  | { totalScore, maxScore, durationMs }                  |
 *
 * @module useEventLog
 */

import { useState, useCallback } from "react";

/**
 * @typedef {Object} LogEvent
 * @property {string} type - Type d'événement (voir tableau ci-dessus)
 * @property {Object} data - Données associées à l'événement
 * @property {number} t    - Timestamp unix en millisecondes (Date.now())
 */

/**
 * @typedef {Object} PredictData
 * @property {number}  idx       - Index de la situation
 * @property {number}  predicted - Valeur saisie par l'élève
 * @property {number}  actual    - Valeur correcte
 * @property {boolean} correct   - predicted === actual
 */

/**
 * @typedef {Object} UseEventLogReturn
 * @property {LogEvent[]} events   - Journal complet des événements
 * @property {Function}   log      - Émet un événement : log(type, data)
 * @property {Function}   resetLog - Vide le journal
 */

/**
 * Hook de gestion du journal d'événements pédagogiques.
 *
 * @returns {UseEventLogReturn}
 *
 * @example
 * const { events, log, resetLog } = useEventLog();
 * log('SIT_START', { idx: 0, id: 'tg1', label: 'Grand triangle ①' });
 */
export function useEventLog() {
    const [events, setEvents] = useState([]);

    /**
     * Émet un événement horodaté dans le journal.
     *
     * @param {string} type - Type d'événement (constante uppercasée)
     * @param {Object} data - Payload de l'événement
     */
    const log = useCallback((type, data) => {
        setEvents((prev) => [...prev, { type, data, t: Date.now() }]);
    }, []);

    /**
     * Réinitialise le journal (typiquement au changement d'atelier).
     */
    const resetLog = useCallback(() => setEvents([]), []);

    return { events, log, resetLog };
}
