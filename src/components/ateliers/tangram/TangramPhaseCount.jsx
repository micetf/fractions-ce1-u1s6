/**
 * @file TangramPhaseCount — interface de vérification par manipulation.
 *
 * @description
 * Composant de présentation : aucun état interne, aucun handler métier.
 * Affiche les contrôles d'ajout/retrait de pièces, le feedback procédural
 * (incluant la correction de prédiction via type "warn"), et le bouton
 * de validation.
 *
 * ────────────────────────────────────────────────────────────────
 * Feedback warn vs ok
 * ────────────────────────────────────────────────────────────────
 * - `ok`   : prédiction correcte ou pas de prédiction — vert émeraude
 * - `warn` : manipulation réussie mais prédiction inexacte — ambre
 *
 * Dans les deux cas le bouton "Continuer →" est affiché via Bubble,
 * car la manipulation est correcte et l'élève peut avancer.
 *
 * Le bouton de validation est masqué dès qu'un feedback ok/warn
 * est présent (feedback.type === "ok" || feedback.type === "warn").
 *
 * @module TangramPhaseCount
 */

import PropTypes from "prop-types";
import Bubble from "../../ui/Bubble.jsx";

/**
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation (TG[idx])
 * @param {number}   props.placed     - Pièces placées (0..s.n)
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Transition vers la phase name
 * @param {Function} props.onAdd      - Ajouter une pièce
 * @param {Function} props.onRemove   - Retirer la dernière pièce
 * @param {Function} props.onValidate - Valider le comptage
 */
export default function TangramPhaseCount({
    situation: s,
    placed,
    feedback,
    onContinue,
    onAdd,
    onRemove,
    onValidate,
}) {
    const isSuccess = feedback?.type === "ok" || feedback?.type === "warn";

    return (
        <div className="flex flex-col gap-3">
            {/* Contrôles ajout / retrait */}
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onAdd}
                    aria-label="Ajouter une pièce"
                    className="btn-add flex-1 py-4 rounded-2xl text-2xl font-bold
                               text-white shadow-md touch-manipulation"
                    style={{ background: s.color }}
                >
                    ➕ Ajouter
                </button>
                <button
                    onClick={onRemove}
                    disabled={placed === 0}
                    aria-label="Retirer la dernière pièce"
                    className="btn-add py-4 px-5 rounded-2xl text-xl font-bold
                               bg-white border-2 border-slate-200 text-slate-600
                               disabled:opacity-30"
                >
                    ↩
                </button>
            </div>

            {/* Feedback procédural (ok, warn ou err) */}
            {feedback && (
                <Bubble
                    type={feedback.type}
                    msg={feedback.msg}
                    onContinue={isSuccess ? onContinue : null}
                />
            )}

            {/* Bouton de validation — masqué dès qu'ok ou warn */}
            {!isSuccess && (
                <button
                    onClick={onValidate}
                    className="py-4 rounded-2xl text-lg font-bold text-white
                               shadow-md hover:brightness-110 active:scale-95
                               transition-all touch-manipulation"
                    style={{ background: "#1E40AF" }}
                >
                    ✓ Le {s.tout} est rempli !
                </button>
            )}
        </div>
    );
}

TangramPhaseCount.propTypes = {
    /** Données de la situation issue de tangram.js */
    situation: PropTypes.shape({
        color: PropTypes.string.isRequired,
        tout: PropTypes.string.isRequired,
    }).isRequired,
    /** Nombre de pièces posées (0..s.n) */
    placed: PropTypes.number.isRequired,
    /** Feedback courant — null si aucun message à afficher */
    feedback: PropTypes.shape({
        type: PropTypes.oneOf(["ok", "err", "warn"]).isRequired,
        msg: PropTypes.string.isRequired,
    }),
    /** Déclenché par Bubble "Continuer →" quand ok ou warn */
    onContinue: PropTypes.func.isRequired,
    /** Ajouter une pièce au carré */
    onAdd: PropTypes.func.isRequired,
    /** Retirer la dernière pièce posée */
    onRemove: PropTypes.func.isRequired,
    /** Valider que le carré est rempli */
    onValidate: PropTypes.func.isRequired,
};

TangramPhaseCount.defaultProps = {
    feedback: null,
};
