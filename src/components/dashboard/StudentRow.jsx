/**
 * @file StudentRow.jsx — ligne cliquable dans ClassTracker.
 *
 * @description
 * Affiche la progression synthétique d'un élève et ouvre `StudentDetail`
 * au clic. Les actions de réinitialisation ont été déplacées dans
 * `StudentDetail` pour plus de contextualité et moins de risque accidentel.
 *
 * @module StudentRow
 */

import PropTypes from "prop-types";

/** Couleur par statut (cohérent avec SituationDot). */
const STATUS_COLOR = {
    perfect: "#10B981",
    good: "#F59E0B",
    struggled: "#F97316",
};

/** Formate une date ISO en "jj/mm". */
const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
    });

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * @param {Object}       props
 * @param {string}       props.pseudo   - Pseudo de l'élève
 * @param {Object|null}  props.session  - Session persistée (null = pas commencé)
 * @param {number}       props.total    - Nombre total de situations
 * @param {Function}     props.onSelect - Ouvre StudentDetail pour cet élève
 */
export default function StudentRow({ pseudo, session, total, onSelect }) {
    const hasSessions = session !== null;
    const done = hasSessions ? session.situations.length : 0;

    return (
        <button
            onClick={onSelect}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl
                       text-left hover:bg-white/10 transition-colors touch-manipulation"
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

            {/* Avancement ou badge terminé */}
            {hasSessions && (
                <span className="text-white/60 text-xs font-bold shrink-0 w-12 text-right">
                    {session.completed ? (
                        <span className="text-emerald-400">✓ fin</span>
                    ) : (
                        `${done}/${total}`
                    )}
                </span>
            )}

            {/* Date */}
            {hasSessions && (
                <span className="text-white/30 text-xs shrink-0 w-10 text-right">
                    {fmtDate(session.openedAt)}
                </span>
            )}

            {/* Chevron */}
            <span className="text-white/25 font-bold shrink-0">›</span>
        </button>
    );
}

StudentRow.propTypes = {
    pseudo: PropTypes.string.isRequired,
    session: PropTypes.shape({
        openedAt: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
        situations: PropTypes.array.isRequired,
    }),
    total: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
};

StudentRow.defaultProps = { session: null };
