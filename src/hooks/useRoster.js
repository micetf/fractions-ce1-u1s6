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
 * - L'identifiant est un UUID v4 généré par `crypto.randomUUID()`.
 *
 * @module useRoster
 */

import { useState, useCallback } from "react";
import { STORAGE_KEYS, readStorage, writeStorage } from "../utils/storage.js";

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Longueur maximale d'un pseudo élève. */
export const MAX_PSEUDO_LENGTH = 20;

// ─── Typedef ───────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Student
 * @property {string} id        - UUID v4 généré à la création
 * @property {string} pseudo    - Pseudo affiché (ex : "Fred M")
 * @property {string} createdAt - Date ISO 8601 de création
 */

/**
 * @typedef {Object} UseRosterReturn
 * @property {Student[]} students                       - Liste triée alphabétiquement
 * @property {Function}  addStudent    (pseudo) → err|null - Ajoute un élève
 * @property {Function}  removeStudent (id)    → void      - Supprime un élève
 * @property {Function}  renameStudent (id, pseudo) → err|null - Renomme un élève
 */

// ─── Helpers privés ────────────────────────────────────────────────────────────

/** @param {Student[]} list @returns {Student[]} */
const sortByPseudo = (list) =>
    [...list].sort((a, b) => a.pseudo.localeCompare(b.pseudo, "fr"));

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Gestion du registre d'élèves persisté dans localStorage.
 *
 * @returns {UseRosterReturn}
 *
 * @example
 * const { students, addStudent, removeStudent } = useRoster();
 * const err = addStudent("Fred M");
 * if (err) console.warn(err); // "Pseudo déjà utilisé"
 */
export function useRoster() {
    const [students, setStudents] = useState(() =>
        sortByPseudo(readStorage(STORAGE_KEYS.ROSTER, []))
    );

    /** Persiste et met à jour l'état en une seule opération. */
    const persist = useCallback((next) => {
        const sorted = sortByPseudo(next);
        writeStorage(STORAGE_KEYS.ROSTER, sorted);
        setStudents(sorted);
    }, []);

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
                    id: crypto.randomUUID(),
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

    return { students, addStudent, removeStudent, renameStudent };
}
