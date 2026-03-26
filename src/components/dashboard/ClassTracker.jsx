/**
 * @file ClassTracker.jsx — suivi de la classe à deux niveaux.
 *
 * @description
 * Niveau 1 — Liste classe :
 *   Une ligne cliquable par élève (StudentRow). Progression synthétique.
 *   Un seul bouton de reset en bas : "Tout réinitialiser" (tous élèves,
 *   tous ateliers) — protégé par ConfirmModal.
 *
 * Niveau 2 — Détail élève (StudentDetail) :
 *   Bilan complet : métriques, SituationsTable, ErrPill.
 *   Resets contextuels : cet atelier / tous les ateliers.
 *   Après un reset, retour automatique à la liste.
 *
 * Resets disponibles :
 *   - Élève / atelier courant    → dans StudentDetail
 *   - Élève / tous les ateliers  → dans StudentDetail
 *   - Tous / tous                → en bas de la liste classe
 *
 * @module ClassTracker
 */

import { useState } from "react";
import PropTypes from "prop-types";
import StudentRow from "./StudentRow.jsx";
import StudentDetail from "./StudentDetail.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * @param {Object}   props
 * @param {Array}    props.students       - Registre élèves
 * @param {Object}   props.traces         - Store de traces complet
 * @param {string}   props.atelierID      - Identifiant atelier courant
 * @param {Object}   props.atelierMeta    - Métadonnées (icon, label, total)
 * @param {Function} props.resetStudent   - (atelierID, studentId) → void
 * @param {Function} props.resetStudentAll - (studentId) → void
 * @param {Function} props.resetAll       - () → void
 */
export default function ClassTracker({
    students,
    traces,
    atelierID,
    atelierMeta,
    resetStudent,
    resetStudentAll,
    resetAll,
}) {
    const [selectedId, setSelectedId] = useState(null);
    const [confirmReset, setConfirmReset] = useState(false);

    const atelierTraces = traces[atelierID] ?? {};

    // ── Niveau 2 : détail élève ────────────────────────────────────────────────

    if (selectedId) {
        const student = students.find((s) => s.id === selectedId);
        const session = atelierTraces[selectedId] ?? null;

        // Garde-fou : élève supprimé pendant la navigation
        if (!student) {
            setSelectedId(null);
            return null;
        }

        return (
            <StudentDetail
                student={student}
                session={session}
                atelierMeta={atelierMeta}
                onBack={() => setSelectedId(null)}
                onResetAtelier={() => {
                    resetStudent(atelierID, selectedId);
                    setSelectedId(null);
                }}
                onResetAll={() => {
                    resetStudentAll(selectedId);
                    setSelectedId(null);
                }}
            />
        );
    }

    // ── Niveau 1 : liste classe ────────────────────────────────────────────────

    return (
        <div
            className="rounded-2xl p-4 mb-3"
            style={{ background: "rgba(255,255,255,.06)" }}
        >
            {/* En-tête */}
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">
                {atelierMeta.icon} Progression · {atelierMeta.label}
            </p>

            {/* Liste élèves */}
            {students.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-6 font-semibold">
                    Aucun élève dans le registre
                </p>
            ) : (
                <div className="flex flex-col gap-1 mb-4">
                    {students.map((s) => (
                        <StudentRow
                            key={s.id}
                            pseudo={s.pseudo}
                            session={atelierTraces[s.id] ?? null}
                            total={atelierMeta.total}
                            onSelect={() => setSelectedId(s.id)}
                        />
                    ))}
                </div>
            )}

            {/* Reset global — seule action disponible à ce niveau */}
            <div className="border-t border-white/10 pt-3">
                <button
                    onClick={() => setConfirmReset(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-300
                               border border-red-500/40 hover:bg-red-900/30
                               transition-colors touch-manipulation"
                >
                    🗑 Tout réinitialiser (tous les élèves, tous les ateliers)
                </button>
            </div>

            {/* Modale de confirmation reset global */}
            {confirmReset && (
                <ConfirmModal
                    title="Tout réinitialiser ?"
                    message="La progression de tous les élèves sur tous les ateliers sera effacée. Cette action est irréversible."
                    confirmLabel="Tout réinitialiser"
                    danger
                    onConfirm={() => {
                        resetAll();
                        setConfirmReset(false);
                    }}
                    onCancel={() => setConfirmReset(false)}
                />
            )}
        </div>
    );
}

ClassTracker.propTypes = {
    students: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            pseudo: PropTypes.string.isRequired,
        })
    ).isRequired,
    traces: PropTypes.object.isRequired,
    atelierID: PropTypes.string.isRequired,
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
    }).isRequired,
    resetStudent: PropTypes.func.isRequired,
    resetStudentAll: PropTypes.func.isRequired,
    resetAll: PropTypes.func.isRequired,
};
