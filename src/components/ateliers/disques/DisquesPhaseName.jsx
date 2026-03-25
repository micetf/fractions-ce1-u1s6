/**
 * @file DisquesPhaseName — interface de nommage de la fraction.
 *
 * @description
 * Composant de présentation : aucun état interne, aucun handler métier.
 * Affiche les 4 options de nommage et le feedback procédural.
 *
 * ────────────────────────────────────────────────────────────────
 * Différence avec TangramPhaseName
 * ────────────────────────────────────────────────────────────────
 * Les options ne sont pas stockées dans les données (disques.js) mais
 * générées dynamiquement via `useMemo` dans l'orchestrateur
 * (AtelierDisques) à partir de FNAME. Ce composant reçoit donc `opts`
 * et `answer` séparément, sans accès à la situation complète.
 *
 * ────────────────────────────────────────────────────────────────
 * États visuels des boutons (prop v de Btn)
 * ────────────────────────────────────────────────────────────────
 * - `idle` : état neutre — aucun feedback reçu
 * - `ok`   : bonne réponse — vert, après feedback ok
 * - `off`  : mauvaise option — grisée, après feedback ok
 *
 * @module DisquesPhaseName
 */

import PropTypes from "prop-types";
import Btn from "../../ui/Btn.jsx";
import Bubble from "../../ui/Bubble.jsx";

/**
 * @param {Object}   props
 * @param {string[]} props.opts       - Quatre options de nommage
 * @param {string}   props.answer     - Fraction attendue (ex : "un cinquième")
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Avancement à la situation suivante
 * @param {Function} props.onSelect   - Callback(option: string)
 */
export default function DisquesPhaseName({
    opts,
    answer,
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
                {opts.map((opt) => {
                    let v = "idle";
                    if (feedback?.type === "ok") {
                        v = opt === answer ? "ok" : "off";
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

DisquesPhaseName.propTypes = {
    /** Options générées dynamiquement par l'orchestrateur */
    opts: PropTypes.arrayOf(PropTypes.string).isRequired,
    /** Fraction attendue — utilisée pour colorier ok/off après feedback */
    answer: PropTypes.string.isRequired,
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

DisquesPhaseName.defaultProps = {
    feedback: null,
};
