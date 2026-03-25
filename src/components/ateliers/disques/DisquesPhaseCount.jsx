/**
 * @file DisquesPhaseCount — interface de vérification par manipulation.
 *
 * @description
 * Composant de présentation : aucun état interne, aucun handler métier.
 * Affiche les contrôles d'ajout/retrait de parts, le feedback procédural
 * (incluant la correction de prédiction via type "warn"), et le bouton
 * de validation.
 *
 * ────────────────────────────────────────────────────────────────
 * Feedback warn vs ok
 * ────────────────────────────────────────────────────────────────
 * - `ok`   : prédiction correcte ou absente — vert émeraude
 * - `warn` : manipulation réussie, prédiction inexacte — ambre
 *
 * Dans les deux cas le bouton "Continuer →" est affiché via Bubble :
 * la manipulation est correcte, l'élève peut avancer.
 *
 * Le bouton de validation est masqué dès qu'un feedback ok/warn
 * est présent.
 *
 * @module DisquesPhaseCount
 */

import PropTypes from "prop-types";
import Bubble from "../../ui/Bubble.jsx";

/**
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation (DQ[idx])
 * @param {number}   props.placed     - Parts placées (0..d.n)
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Transition vers la phase name
 * @param {Function} props.onAdd      - Ajouter une part
 * @param {Function} props.onRemove   - Retirer la dernière part
 * @param {Function} props.onValidate - Valider le comptage
 */
export default function DisquesPhaseCount({
    situation: d,
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
                    aria-label="Ajouter une part"
                    className="btn-add flex-1 py-4 rounded-2xl text-2xl font-bold
                               text-white shadow-md touch-manipulation"
                    style={{ background: d.color }}
                >
                    ➕ Ajouter
                </button>
                <button
                    onClick={onRemove}
                    disabled={placed === 0}
                    aria-label="Retirer la dernière part"
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
                    style={{ background: "#4C1D95" }}
                >
                    ✓ Le disque est rempli !
                </button>
            )}
        </div>
    );
}

DisquesPhaseCount.propTypes = {
    /** Données de la situation issue de disques.js */
    situation: PropTypes.shape({
        color: PropTypes.string.isRequired,
    }).isRequired,
    /** Nombre de parts placées (0..d.n) */
    placed: PropTypes.number.isRequired,
    /** Feedback courant — null si aucun message à afficher */
    feedback: PropTypes.shape({
        type: PropTypes.oneOf(["ok", "err", "warn"]).isRequired,
        msg: PropTypes.string.isRequired,
    }),
    /** Déclenché par Bubble "Continuer →" quand ok ou warn */
    onContinue: PropTypes.func.isRequired,
    /** Ajouter une part au disque */
    onAdd: PropTypes.func.isRequired,
    /** Retirer la dernière part posée */
    onRemove: PropTypes.func.isRequired,
    /** Valider que le disque est rempli */
    onValidate: PropTypes.func.isRequired,
};

DisquesPhaseCount.defaultProps = {
    feedback: null,
};
