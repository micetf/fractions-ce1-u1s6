/**
 * @file CuisenairePhaseCount — interface de vérification par manipulation.
 *
 * @description
 * Composant de présentation : aucun état interne, aucun handler métier.
 * Affiche les contrôles d'ajout/retrait de réglettes, le bouton d'indice,
 * le feedback procédural (incluant la correction de prédiction via "warn"),
 * et le bouton de validation.
 *
 * Spécificité Cuisenaire par rapport aux autres ateliers :
 * - Un bouton "Besoin d'un indice ?" est disponible (une seule fois)
 * - L'indice est affiché via une Bubble type "hint" une fois activé
 * - Son utilisation est tracée dans le journal (HINT_USED)
 *
 * ────────────────────────────────────────────────────────────────
 * Feedback warn vs ok
 * ────────────────────────────────────────────────────────────────
 * - `ok`   : prédiction correcte ou absente — vert émeraude
 * - `warn` : manipulation réussie, prédiction inexacte — ambre
 *
 * Dans les deux cas le bouton "Continuer →" est affiché via Bubble.
 * Le bouton de validation est masqué dès qu'ok ou warn est présent.
 *
 * @module CuisenairePhaseCount
 */

import PropTypes from "prop-types";
import Bubble from "../../ui/Bubble.jsx";

/** Couleur thématique Cuisenaire — utilisée pour le bouton de validation */
const COLOR = "#B45309";

/**
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation (CUI[idx])
 * @param {number}   props.placed     - Réglettes posées (0..c.n)
 * @param {boolean}  props.hintShown  - Indice déjà affiché
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Transition vers la phase name
 * @param {Function} props.onAdd      - Ajouter une réglette
 * @param {Function} props.onRemove   - Retirer la dernière réglette
 * @param {Function} props.onHint     - Afficher l'indice (une seule fois)
 * @param {Function} props.onValidate - Valider le comptage
 */
export default function CuisenairePhaseCount({
    situation: c,
    placed,
    hintShown,
    feedback,
    onContinue,
    onAdd,
    onRemove,
    onHint,
    onValidate,
}) {
    const isSuccess = feedback?.type === "ok" || feedback?.type === "warn";

    return (
        <div className="flex flex-col gap-3">
            {/* Contrôles ajout / retrait */}
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onAdd}
                    aria-label="Ajouter une réglette"
                    className="btn-add flex-1 py-4 rounded-2xl text-2xl font-bold
                               text-white shadow-md touch-manipulation"
                    style={{ background: COLOR }}
                >
                    ➕ Ajouter
                </button>
                <button
                    onClick={onRemove}
                    disabled={placed === 0}
                    aria-label="Retirer la dernière réglette"
                    className="btn-add py-4 px-5 rounded-2xl text-xl font-bold
                               bg-white border-2 border-slate-200 text-slate-600
                               disabled:opacity-30"
                >
                    ↩
                </button>
            </div>

            {/* Bouton indice — affiché une seule fois, avant activation */}
            {!hintShown && (
                <button
                    onClick={onHint}
                    className="text-xs text-amber-700 underline text-center
                               touch-manipulation py-1"
                >
                    Besoin d'un indice ?
                </button>
            )}

            {/* Indice affiché après activation */}
            {hintShown && <Bubble type="hint" msg={`💡 ${c.hint}`} />}

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
                    style={{ background: "#92400E" }}
                >
                    ✓ La réglette {c.refName} est couverte !
                </button>
            )}
        </div>
    );
}

CuisenairePhaseCount.propTypes = {
    /** Données de la situation issue de cuisenaire.js */
    situation: PropTypes.shape({
        refName: PropTypes.string.isRequired,
        hint: PropTypes.string.isRequired,
    }).isRequired,
    /** Réglettes posées (0..c.n) */
    placed: PropTypes.number.isRequired,
    /** Indice déjà activé par l'élève */
    hintShown: PropTypes.bool.isRequired,
    /** Feedback courant — null si aucun message */
    feedback: PropTypes.shape({
        type: PropTypes.oneOf(["ok", "err", "warn"]).isRequired,
        msg: PropTypes.string.isRequired,
    }),
    /** Déclenché par Bubble "Continuer →" quand ok ou warn */
    onContinue: PropTypes.func.isRequired,
    /** Ajouter une réglette dans la zone d'accumulation */
    onAdd: PropTypes.func.isRequired,
    /** Retirer la dernière réglette posée */
    onRemove: PropTypes.func.isRequired,
    /** Afficher l'indice (une seule activation possible) */
    onHint: PropTypes.func.isRequired,
    /** Valider que la réglette de référence est couverte */
    onValidate: PropTypes.func.isRequired,
};

CuisenairePhaseCount.defaultProps = {
    feedback: null,
};
