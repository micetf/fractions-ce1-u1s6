/**
 * @file TangramPhaseName — interface de nommage de la fraction.
 *
 * @description
 * Composant de présentation : aucun état interne, aucun handler métier.
 * Affiche les 4 options de nommage et le feedback procédural.
 *
 * ────────────────────────────────────────────────────────────────
 * États visuels des boutons (prop v de Btn)
 * ────────────────────────────────────────────────────────────────
 * - `idle` : état neutre — aucun feedback reçu
 * - `ok`   : bonne réponse — vert, après feedback ok
 * - `off`  : mauvaise option — grisée, après feedback ok
 *
 * Les boutons sont figés après un feedback ok (locked dans
 * AtelierTangram) : onSelect n'est plus appelé.
 *
 * @module TangramPhaseName
 */

import PropTypes from "prop-types";
import Btn from "../../ui/Btn.jsx";
import Bubble from "../../ui/Bubble.jsx";

/**
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation (TG[idx])
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Avancement à la situation suivante
 * @param {Function} props.onSelect   - Callback(option: string)
 */
export default function TangramPhaseName({
    situation: s,
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
                {s.fOpts.map((opt) => {
                    let v = "idle";
                    if (feedback?.type === "ok") {
                        v = opt === s.answer ? "ok" : "off";
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

TangramPhaseName.propTypes = {
    /** Données de la situation issue de tangram.js */
    situation: PropTypes.shape({
        answer: PropTypes.string.isRequired,
        fOpts: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    /** Feedback courant — null si aucun message à afficher */
    feedback: PropTypes.shape({
        type: PropTypes.oneOf(["ok", "err"]).isRequired,
        msg: PropTypes.string.isRequired,
    }),
    /** Déclenché par Bubble "Continuer →" après réponse correcte */
    onContinue: PropTypes.func.isRequired,
    /** Appelé avec l'option choisie par l'élève */
    onSelect: PropTypes.func.isRequired,
};

TangramPhaseName.defaultProps = {
    feedback: null,
};
