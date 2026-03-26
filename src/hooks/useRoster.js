/**
 * @file useRoster.js — gestion du registre d'élèves.
 *
 * @description
 * Expose un CRUD complet sur la liste des élèves, persistée dans
 * `localStorage` sous la clé `fce1u1s6_roster`.
 *
 * Règles métier appliquées :
 * - Le pseudo est normalisé (trim) et ne peut être vide.
 * - La longueur maximale d'un pseudo est {@link MAX_PSEUDO_LENGTH} caractères.
 * - Les doublons (insensibles à la casse) sont rejetés.
 * - L'identifiant est un UUID v4 généré par {@link generateUUID} — compatible
 *   HTTP et HTTPS (contextes sécurisés et non sécurisés).
 *
 * `storageError` passe à `true` si une écriture localStorage échoue
 * (quota dépassé, navigation privée). L'état React est quand même mis
 * à jour — la session reste fonctionnelle, seule la persistance est perdue.
 *
 * @module useRoster
 */

import { useState, useCallback } from "react";
import { STORAGE_KEYS, readStorage, writeStorage } from "../utils/storage.js";
import { generateUUID } from "../utils/uuid.js";

/** Longueur maximale d'un pseudo élève. */
export const MAX_PSEUDO_LENGTH = 20;

/**
 * @typedef {Object} Student
 * @property {string} id        - UUID v4 généré à la création
 * @property {string} pseudo    - Pseudo affiché (ex : "Fred M")
 * @property {string} createdAt - Date ISO 8601 de création
 */

/**
 * @typedef {Object} UseRosterReturn
 * @property {Student[]} students                            - Liste triée alphabétiquement
 * @property {Function}  addStudent    (pseudo) → err|null  - Ajoute un élève
 * @property {Function}  removeStudent (id)    → void       - Supprime un élève
 * @property {Function}  renameStudent (id, pseudo) → err|null - Renomme un élève
 * @property {boolean}   storageError                       - Vrai si la dernière écriture a échoué
 * @property {Function}  clearStorageError ()  → void       - Réinitialise l'erreur
 */

/** @param {Student[]} list @returns {Student[]} */
const sortByPseudo = (list) =>
    [...list].sort((a, b) => a.pseudo.localeCompare(b.pseudo, "fr"));

/**
 * Gestion du registre d'élèves persisté dans localStorage.
 *
 * @returns {UseRosterReturn}
 *
 * @example
 * const { students, addStudent, storageError } = useRoster();
 * const err = addStudent("Fred M");
 * if (err) console.warn(err); // "Pseudo déjà utilisé"
 */
export function useRoster() {
    const [students, setStudents] = useState(() =>
        sortByPseudo(readStorage(STORAGE_KEYS.ROSTER, []))
    );
    const [storageError, setStorageError] = useState(false);

    /**
     * Persiste et met à jour l'état en une seule opération.
     * Signale `storageError` si l'écriture localStorage échoue.
     */
    const persist = useCallback((next) => {
        const sorted = sortByPseudo(next);
        const ok = writeStorage(STORAGE_KEYS.ROSTER, sorted);
        if (!ok) setStorageError(true);
        setStudents(sorted);
    }, []);

    /** Réinitialise le signal d'erreur (appelé par App après affichage du toast). */
    const clearStorageError = useCallback(() => setStorageError(false), []);

    /** Valide un pseudo et retourne un message d'erreur ou null. */
    const validate = useCallback(
        (pseudo, excludeId = null) => {
            const trimmed = pseudo.trim();
            if (!trimmed) return "Le pseudo ne peut pas être vide.";
            if (trimmed.length > MAX_PSEUDO_LENGTH)
                return `Le pseudo ne peut pas dépasser ${MAX_PSEUDO_LENGTH} caractères.`;
            const duplicate = students.some(
                (s) =>
                    s.id !== excludeId &&
                    s.pseudo.toLowerCase() === trimmed.toLowerCase()
            );
            if (duplicate) return "Ce pseudo est déjà utilisé.";
            return null;
        },
        [students]
    );

    const addStudent = useCallback(
        (pseudo) => {
            const err = validate(pseudo);
            if (err) return err;
            const next = [
                ...students,
                {
                    id: generateUUID(),
                    pseudo: pseudo.trim(),
                    createdAt: new Date().toISOString(),
                },
            ];
            persist(next);
            return null;
        },
        [students, validate, persist]
    );

    const removeStudent = useCallback(
        (id) => persist(students.filter((s) => s.id !== id)),
        [students, persist]
    );

    const renameStudent = useCallback(
        (id, pseudo) => {
            const err = validate(pseudo, id);
            if (err) return err;
            persist(
                students.map((s) =>
                    s.id === id ? { ...s, pseudo: pseudo.trim() } : s
                )
            );
            return null;
        },
        [students, validate, persist]
    );

    return {
        students,
        addStudent,
        removeStudent,
        renameStudent,
        storageError,
        clearStorageError,
    };
}
