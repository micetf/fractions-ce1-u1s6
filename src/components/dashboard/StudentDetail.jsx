/**
 * @file StudentDetail.jsx — vue bilan d'un élève pour un atelier.
 *
 * @description
 * Affiche le bilan complet d'un élève depuis ses traces persistées.
 * Le bouton 🖨 Imprimer est disponible uniquement si l'élève a des données.
 *
 * La classe `print-student-detail` sur le conteneur racine permet aux règles
 * `@media print` de `index.css` de forcer fond blanc + texte sombre,
 * rendant le composant lisible à l'impression malgré son contexte sombre.
 *
 * @module StudentDetail
 */

import { useState } from "react";
import PropTypes from "prop-types";
import { fmtMs } from "../../utils/time.js";
import { useSessionStats } from "../../hooks/useSessionStats.js";
import MetricCard from "./MetricCard.jsx";
import SituationsTable from "./SituationsTable.jsx";
import ErrPill from "./ErrPill.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

// ─── Sous-composant : zone de réinitialisation ─────────────────────────────────

function ResetZone({ pseudo, atelierLabel, onResetAtelier, onResetAll }) {
    const [pending, setPending] = useState(null);

    return (
        <div className="border-t border-white/10 pt-3 mt-1 no-print">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
                Réinitialisation
            </p>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setPending("atelier")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300
                               border border-amber-500/40 hover:bg-amber-900/30
                               transition-colors touch-manipulation"
                >
                    🗑 Cet atelier
                </button>
                <button
                    onClick={() => setPending("all")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-300
                               border border-red-500/40 hover:bg-red-900/30
                               transition-colors touch-manipulation"
                >
                    🗑 Tous les ateliers
                </button>
            </div>

            {pending === "atelier" && (
                <ConfirmModal
                    title={`Réinitialiser ${pseudo} sur ${atelierLabel} ?`}
                    message="La progression de cet élève sur cet atelier sera effacée."
                    confirmLabel="Réinitialiser"
                    danger
                    onConfirm={onResetAtelier}
                    onCancel={() => setPending(null)}
                />
            )}
            {pending === "all" && (
                <ConfirmModal
                    title={`Réinitialiser ${pseudo} sur tous les ateliers ?`}
                    message="Toutes les traces de cet élève seront effacées."
                    confirmLabel="Réinitialiser"
                    danger
                    onConfirm={onResetAll}
                    onCancel={() => setPending(null)}
                />
            )}
        </div>
    );
}

ResetZone.propTypes = {
    pseudo: PropTypes.string.isRequired,
    atelierLabel: PropTypes.string.isRequired,
    onResetAtelier: PropTypes.func.isRequired,
    onResetAll: PropTypes.func.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * @param {Object}      props
 * @param {Object}      props.student       - Élève ({ id, pseudo })
 * @param {Object|null} props.session       - Session persistée (null = pas commencé)
 * @param {Object}      props.atelierMeta   - Métadonnées de l'atelier (icon, label, total)
 * @param {Function}    props.onBack        - Retour à la liste classe
 * @param {Function}    props.onResetAtelier - Reset élève / atelier courant
 * @param {Function}    props.onResetAll    - Reset élève / tous les ateliers
 */
export default function StudentDetail({
    student,
    session,
    atelierMeta,
    onBack,
    onResetAtelier,
    onResetAll,
}) {
    const { done, allDistractors, firstTryPct, avgDur } =
        useSessionStats(session);

    const fmtDate = (iso) =>
        new Date(iso).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        });

    const hasDone = done.length > 0;
    return (
        <div
            className="rounded-2xl mb-3 print-student-detail"
            style={{ background: "rgba(255,255,255,.06)" }}
        >
            {/* ── En-tête ── */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                {/* Retour — masqué à l'impression */}
                <button
                    onClick={onBack}
                    className="no-print text-white/60 hover:text-white font-bold
                               text-lg touch-manipulation transition-colors shrink-0"
                    aria-label="Retour à la liste"
                >
                    ←
                </button>

                <div className="flex-1 min-w-0">
                    <p
                        className="text-white font-bold text-lg truncate"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                        {student.pseudo}
                    </p>
                    <p className="text-white/40 text-xs font-semibold">
                        {atelierMeta.icon} {atelierMeta.label}
                        {session && (
                            <span>
                                {" "}
                                · {fmtDate(session.openedAt)}
                                {session.completed
                                    ? " · ✓ terminé"
                                    : " · en cours"}
                            </span>
                        )}
                    </p>
                </div>

                {/* Bouton imprimer — visible uniquement si données présentes */}
                {hasDone && (
                    <button
                        onClick={() => window.print()}
                        className="no-print w-9 h-9 flex items-center justify-center
                                   rounded-xl text-base text-white/60
                                   border border-white/20 hover:text-white
                                   hover:bg-white/10 transition-colors
                                   touch-manipulation shrink-0"
                        title="Imprimer les résultats de cet élève"
                        aria-label="Imprimer"
                    >
                        🖨
                    </button>
                )}
            </div>

            {/* ── En-tête imprimable — invisible à l'écran ── */}
            <div className="hidden print:block px-4 pt-4 pb-2 border-b border-slate-200">
                <p
                    className="text-lg font-bold text-slate-800"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    🧮 Fractions CE1 — Résultats élève
                </p>
                <div className="flex flex-wrap gap-x-6 mt-1">
                    <p className="text-sm font-bold text-slate-700">
                        👤 {student.pseudo}
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                        {atelierMeta.icon} {atelierMeta.label}
                    </p>
                    {session && (
                        <p className="text-sm font-bold text-slate-700">
                            📅 {fmtDate(session.openedAt)}
                            {session.completed ? " · ✓ terminé" : " · en cours"}
                        </p>
                    )}
                    <p className="text-sm font-bold text-slate-700">
                        🖨{" "}
                        {new Date().toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>
            </div>

            {/* ── Contenu ── */}
            <div className="p-4">
                {!hasDone ? (
                    <p className="text-white/40 text-sm text-center py-6 font-semibold">
                        Aucune situation enregistrée pour cet élève.
                    </p>
                ) : (
                    <>
                        {/* Métriques */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <MetricCard
                                icon="📍"
                                label="Avancement"
                                value={`${done.length}/${atelierMeta.total}`}
                                sub={`${Math.round((done.length / atelierMeta.total) * 100)}%`}
                                bg="#1A3327"
                                color="#6EE7B7"
                            />
                            <MetricCard
                                icon="🎯"
                                label="1er essai"
                                value={`${firstTryPct}%`}
                                sub="predict + nommage"
                                bg="#321530"
                                color="#F9A8D4"
                            />
                            <MetricCard
                                icon="⏱"
                                label="Moy/sit"
                                value={fmtMs(avgDur)}
                                sub={null}
                                bg="#1E3A5F"
                                color="#93C5FD"
                            />
                        </div>

                        {/* Tableau détaillé */}
                        <SituationsTable done={done} />

                        {/* Distracteurs */}
                        {allDistractors.length > 0 && (
                            <div className="bg-white rounded-2xl p-4 mb-3">
                                <p
                                    className="text-slate-600 text-xs font-bold
                                              uppercase tracking-widest mb-2"
                                >
                                    Erreurs — distracteurs
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {allDistractors.map((d, i) => (
                                        <ErrPill
                                            key={i}
                                            chosen={d.chosen}
                                            answer={d.answer}
                                            count={d.count}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Zone reset — masquée à l'impression via no-print dans ResetZone */}
                <ResetZone
                    pseudo={student.pseudo}
                    atelierLabel={atelierMeta.label}
                    onResetAtelier={onResetAtelier}
                    onResetAll={onResetAll}
                />
            </div>
        </div>
    );
}

StudentDetail.propTypes = {
    student: PropTypes.shape({
        id: PropTypes.string.isRequired,
        pseudo: PropTypes.string.isRequired,
    }).isRequired,
    session: PropTypes.object,
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
    }).isRequired,
    onBack: PropTypes.func.isRequired,
    onResetAtelier: PropTypes.func.isRequired,
    onResetAll: PropTypes.func.isRequired,
};

StudentDetail.defaultProps = { session: null };
