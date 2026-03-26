/**
 * @file ClassTracker.jsx — suivi de progression de la classe pour un atelier.
 *
 * @description
 * Affiche une ligne par élève avec sa progression sur l'atelier courant.
 * Les actions de réinitialisation sont toutes protégées par une ConfirmModal.
 *
 * Trois portées de réinitialisation :
 * - Individuelle  : un élève / atelier courant
 * - Atelier       : tous les élèves / atelier courant
 * - Totale        : tous les élèves / tous les ateliers
 *
 * @module ClassTracker
 */

import { useState } from "react";
import PropTypes from "prop-types";
import StudentRow from "./StudentRow.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

// ─── Typedef ───────────────────────────────────────────────────────────────────

/**
 * @typedef {'student'|'atelier'|'all'} ResetType
 * @typedef {{ type: ResetType, studentId?: string, pseudo?: string }} PendingReset
 */

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Tableau de suivi de la classe pour l'atelier courant.
 *
 * @param {Object}   props
 * @param {Array}    props.students     - Liste des élèves (useRoster)
 * @param {Object}   props.traces       - Store de traces complet (useStudentTraces)
 * @param {string}   props.atelierID    - Identifiant de l'atelier courant ('tg'|'dq'|'cu')
 * @param {Object}   props.atelierMeta  - Métadonnées de l'atelier (icon, label, total)
 * @param {Function} props.resetStudent - (atelierID, studentId) → void
 * @param {Function} props.resetAtelier - (atelierID) → void
 * @param {Function} props.resetAll     - () → void
 *
 * @returns {JSX.Element}
 */
export default function ClassTracker({
    students,
    traces,
    atelierID,
    atelierMeta,
    resetStudent,
    resetAtelier,
    resetAll,
}) {
    /** @type {[PendingReset|null, Function]} */
    const [pending, setPending] = useState(null);

    const atelierTraces = traces[atelierID] ?? {};

    const handleConfirm = () => {
        if (!pending) return;
        if (pending.type === "student")
            resetStudent(atelierID, pending.studentId);
        else if (pending.type === "atelier") resetAtelier(atelierID);
        else resetAll();
        setPending(null);
    };

    return (
        <div
            className="rounded-2xl p-4 mb-3"
            style={{ background: "rgba(255,255,255,.06)" }}
        >
            {/* ── En-tête ── */}
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">
                {atelierMeta.icon} Progression · {atelierMeta.label}
            </p>

            {/* ── Liste des élèves ── */}
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
                            onReset={() =>
                                setPending({
                                    type: "student",
                                    studentId: s.id,
                                    pseudo: s.pseudo,
                                })
                            }
                        />
                    ))}
                </div>
            )}

            {/* ── Zone de réinitialisation globale ── */}
            <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    Réinitialisation
                </p>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setPending({ type: "atelier" })}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold
                                   text-amber-300 border border-amber-500/40
                                   hover:bg-amber-900/30 transition-colors touch-manipulation"
                    >
                        🗑 Tous · {atelierMeta.label}
                    </button>
                    <button
                        onClick={() => setPending({ type: "all" })}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold
                                   text-red-300 border border-red-500/40
                                   hover:bg-red-900/30 transition-colors touch-manipulation"
                    >
                        🗑 Tout réinitialiser
                    </button>
                </div>
            </div>

            {/* ── Modale de confirmation ── */}
            {pending && (
                <ConfirmModal
                    title={
                        pending.type === "student"
                            ? `Réinitialiser ${pending.pseudo} ?`
                            : pending.type === "atelier"
                              ? `Réinitialiser tout l'atelier ${atelierMeta.label} ?`
                              : "Tout réinitialiser ?"
                    }
                    message={
                        pending.type === "student"
                            ? `La progression de ${pending.pseudo} sur l'atelier ${atelierMeta.label} sera effacée.`
                            : pending.type === "atelier"
                              ? `La progression de tous les élèves sur l'atelier ${atelierMeta.label} sera effacée.`
                              : "La progression de tous les élèves sur tous les ateliers sera effacée. Cette action est irréversible."
                    }
                    confirmLabel="Réinitialiser"
                    danger
                    onConfirm={handleConfirm}
                    onCancel={() => setPending(null)}
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
    resetAtelier: PropTypes.func.isRequired,
    resetAll: PropTypes.func.isRequired,
};
