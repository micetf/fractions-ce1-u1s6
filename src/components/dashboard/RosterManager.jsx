/**
 * @file RosterManager.jsx — gestion du registre d'élèves dans le Dashboard.
 *
 * @description
 * Formulaire d'ajout et liste de suppression des élèves.
 * La suppression d'un élève ayant des traces dans un atelier quelconque
 * déclenche une ConfirmModal d'avertissement avant action.
 *
 * @module RosterManager
 */

import { useState } from "react";
import PropTypes from "prop-types";
import ConfirmModal from "./ConfirmModal.jsx";

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Gestion du registre d'élèves depuis l'onglet Suivi du Dashboard.
 *
 * @param {Object}   props
 * @param {Array}    props.students      - Liste des élèves (useRoster)
 * @param {Function} props.addStudent    - Ajoute un élève, retourne err|null
 * @param {Function} props.removeStudent - Supprime un élève par id
 * @param {Object}   props.traces        - Store de traces (pour détecter les traces existantes)
 *
 * @returns {JSX.Element}
 */
export default function RosterManager({
    students,
    addStudent,
    removeStudent,
    traces,
}) {
    const [input, setInput] = useState("");
    const [error, setError] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null); // Student | null

    /** Vérifie si un élève a des traces dans n'importe quel atelier. */
    const hasTraces = (studentId) =>
        Object.values(traces).some((atelier) => !!atelier[studentId]);

    const handleAdd = () => {
        const err = addStudent(input);
        if (err) {
            setError(err);
        } else {
            setInput("");
            setError(null);
        }
    };

    const handleDeleteRequest = (student) => {
        setPendingDelete(student);
    };

    const handleDeleteConfirm = () => {
        if (pendingDelete) {
            removeStudent(pendingDelete.id);
            setPendingDelete(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-4 mb-3">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-3">
                👥 Élèves de la classe
            </p>

            {/* ── Formulaire d'ajout ── */}
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="Pseudo (ex : Fred M)"
                    maxLength={20}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200
                               text-sm font-semibold text-slate-800
                               focus:outline-none focus:border-blue-400 transition-colors"
                />
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700
                               text-white font-bold text-sm transition-colors
                               touch-manipulation shrink-0"
                >
                    Ajouter
                </button>
            </div>

            {/* Message d'erreur de validation */}
            {error && (
                <p className="text-red-600 text-xs font-bold mb-2 px-1">
                    {error}
                </p>
            )}

            {/* ── Liste des élèves ── */}
            {students.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4 font-semibold">
                    Aucun élève dans la liste
                </p>
            ) : (
                <ul className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                    {students.map((s) => (
                        <li
                            key={s.id}
                            className="flex items-center justify-between px-3 py-2
                                       rounded-xl bg-slate-50 border border-slate-100"
                        >
                            <span className="text-slate-800 font-bold text-sm">
                                {s.pseudo}
                            </span>
                            <button
                                onClick={() => handleDeleteRequest(s)}
                                className="text-slate-400 hover:text-red-500 text-sm
                                           font-bold transition-colors touch-manipulation
                                           px-2 py-1 rounded-lg hover:bg-red-50"
                                aria-label={`Supprimer ${s.pseudo}`}
                            >
                                Supprimer
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* ── Modale de confirmation de suppression ── */}
            {pendingDelete && (
                <ConfirmModal
                    title={`Supprimer ${pendingDelete.pseudo} ?`}
                    message={
                        hasTraces(pendingDelete.id)
                            ? `Cet élève a des traces enregistrées. Supprimer ${pendingDelete.pseudo} effacera définitivement toutes ses données.`
                            : `${pendingDelete.pseudo} sera retiré·e de la liste.`
                    }
                    confirmLabel="Supprimer"
                    danger
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setPendingDelete(null)}
                />
            )}
        </div>
    );
}

RosterManager.propTypes = {
    students: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            pseudo: PropTypes.string.isRequired,
        })
    ).isRequired,
    addStudent: PropTypes.func.isRequired,
    removeStudent: PropTypes.func.isRequired,
    traces: PropTypes.object.isRequired,
};
