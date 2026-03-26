/**
 * @file StudentRow.jsx — ligne de suivi d'un élève dans ClassTracker.
 *
 * @description
 * Composant de présentation pur : affiche la progression synthétique
 * d'un élève pour l'atelier courant, à partir de sa session persistée.
 *
 * Indicateurs affichés :
 * - Pseudo de l'élève
 * - Avancement : n situations faites / total (avec points colorés)
 * - Badge ✓ si la session est terminée (ATELIER_DONE reçu)
 * - Date d'ouverture de session (jj/mm)
 * - Bouton de réinitialisation individuelle
 *
 * Codage couleur des points (cohérent avec SituationDot) :
 * - Vert  (#10B981) → perfect
 * - Ambre (#F59E0B) → good
 * - Orange (#F97316) → struggled
 *
 * @module StudentRow
 */

import PropTypes from "prop-types";

/** Couleur par statut de situation (cohérent avec SituationDot). */
const STATUS_COLOR = {
    perfect: "#10B981",
    good: "#F59E0B",
    struggled: "#F97316",
};

/**
 * Formate une date ISO en "jj/mm".
 *
 * @param {string} iso - Date ISO 8601
 * @returns {string}
 */
const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
    });

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Ligne de suivi élève dans le tableau ClassTracker.
 *
 * @param {Object}       props
 * @param {string}       props.pseudo   - Pseudo de l'élève
 * @param {Object|null}  props.session  - Session persistée (null = pas commencé)
 * @param {number}       props.total    - Nombre total de situations de l'atelier
 * @param {Function}     props.onReset  - Ouvre la modale de confirmation de reset
 *
 * @returns {JSX.Element}
 */
export default function StudentRow({ pseudo, session, total, onReset }) {
    const hasSessions = session !== null;
    const done = hasSessions ? session.situations.length : 0;

    return (
        <div
            className="flex items-center gap-3 py-2.5 px-3 rounded-xl
                        bg-white/8 hover:bg-white/12 transition-colors"
        >
            {/* Pseudo */}
            <span
                className="flex-1 text-white font-bold text-sm truncate min-w-0"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
                {pseudo}
            </span>

            {/* Points de progression */}
            {hasSessions ? (
                <div className="flex items-center gap-1 shrink-0">
                    {session.situations.map((s, i) => (
                        <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                                background: STATUS_COLOR[s.status] ?? "#94A3B8",
                            }}
                            title={s.label}
                        />
                    ))}
                    {/* Points gris pour les situations non atteintes */}
                    {Array.from({ length: Math.max(0, total - done) }).map(
                        (_, i) => (
                            <span
                                key={`p-${i}`}
                                className="w-2.5 h-2.5 rounded-full shrink-0 bg-white/20"
                            />
                        )
                    )}
                </div>
            ) : (
                <span className="text-white/30 text-xs font-semibold shrink-0">
                    pas commencé
                </span>
            )}

            {/* Compteur + badge terminé */}
            {hasSessions && (
                <span className="text-white/60 text-xs font-bold shrink-0 w-10 text-right">
                    {session.completed ? (
                        <span className="text-emerald-400 font-bold">
                            ✓ fin
                        </span>
                    ) : (
                        `${done}/${total}`
                    )}
                </span>
            )}

            {/* Date */}
            {hasSessions && (
                <span className="text-white/40 text-xs shrink-0 w-10 text-right">
                    {fmtDate(session.openedAt)}
                </span>
            )}

            {/* Bouton reset individuel */}
            <button
                onClick={onReset}
                disabled={!hasSessions}
                className="shrink-0 p-1.5 rounded-lg text-white/30
                           hover:text-red-400 hover:bg-red-900/30
                           disabled:opacity-20 disabled:cursor-not-allowed
                           transition-colors touch-manipulation"
                title={`Réinitialiser ${pseudo}`}
                aria-label={`Réinitialiser la progression de ${pseudo}`}
            >
                🗑
            </button>
        </div>
    );
}

StudentRow.propTypes = {
    pseudo: PropTypes.string.isRequired,
    session: PropTypes.shape({
        openedAt: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
        situations: PropTypes.arrayOf(
            PropTypes.shape({
                status: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired,
            })
        ).isRequired,
    }),
    total: PropTypes.number.isRequired,
    onReset: PropTypes.func.isRequired,
};

StudentRow.defaultProps = {
    session: null,
};
