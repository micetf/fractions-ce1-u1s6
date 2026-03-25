/**
 * @file CuisenairePhaseName — interface de nommage de la fraction.
 *
 * @description
 * Composant de présentation : aucun état interne, aucun handler métier.
 * Affiche les 4 options de nommage et le feedback procédural.
 *
 * Utilisé pour les deux types de situations :
 * - Situations unitaires    : après la phase count
 * - Situation non-unitaire  : après la phase explain
 *
 * Les options (`c.fOpts`) et la réponse (`c.answer`) sont directement
 * portées par les données de la situation (cuisenaire.js) — contrairement
 * à AtelierDisques où elles sont générées dynamiquement via useMemo.
 *
 * ────────────────────────────────────────────────────────────────
 * États visuels des boutons (prop v de Btn)
 * ────────────────────────────────────────────────────────────────
 * - `idle` : état neutre — aucun feedback reçu
 * - `ok`   : bonne réponse — vert, après feedback ok
 * - `off`  : mauvaise option — grisée, après feedback ok
 *
 * @module CuisenairePhaseName
 */

import PropTypes from "prop-types";
import Btn from "../../ui/Btn.jsx";
import Bubble from "../../ui/Bubble.jsx";

/**
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation (CUI[idx])
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Avancement à la situation suivante
 * @param {Function} props.onSelect   - Callback(option: string)
 */
export default function CuisenairePhaseName({
    situation: c,
    feedback,
    onContinue,
    onSelect,
}) {
    return (
        <div className="flex flex-col gap-3">
            {/* Feedback procédural */}
            {feedback && (
                <Bubble
                    type={feedback.type}
                    msg={feedback.msg}
                    onContinue={feedback.type === "ok" ? onContinue : null}
                />
            )}

            {/* Options de nommage */}
            <div className="flex flex-wrap gap-3 justify-center">
                {c.fOpts.map((opt) => {
                    let v = "idle";
                    if (feedback?.type === "ok") {
                        v = opt === c.answer ? "ok" : "off";
                    }
                    return (
                        <Btn
                            key={opt}
                            label={opt}
                            onClick={() => onSelect(opt)}
                            v={v}
                        />
                    );
                })}
            </div>
        </div>
    );
}

CuisenairePhaseName.propTypes = {
    /** Données de la situation issue de cuisenaire.js */
    situation: PropTypes.shape({
        answer: PropTypes.string.isRequired,
        fOpts: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    /** Feedback courant — null si aucun message */
    feedback: PropTypes.shape({
        type: PropTypes.oneOf(["ok", "err"]).isRequired,
        msg: PropTypes.string.isRequired,
    }),
    /** Déclenché par Bubble "Continuer →" après réponse correcte */
    onContinue: PropTypes.func.isRequired,
    /** Appelé avec l'option choisie par l'élève */
    onSelect: PropTypes.func.isRequired,
};

CuisenairePhaseName.defaultProps = {
    feedback: null,
};
