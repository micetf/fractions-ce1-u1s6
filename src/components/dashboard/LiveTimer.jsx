/**
 * @file LiveTimer — affichage du temps écoulé mis à jour chaque seconde.
 *
 * @description
 * Composant purement affichant. Il déclenche un re-render chaque seconde
 * via un `setInterval` nettoyé proprement au démontage.
 *
 * Utilisé dans le Dashboard pour informer l'enseignant·e du temps
 * total de la séance en cours.
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { fmtMs } from "../../utils/time.js";

/**
 * Minuterie affichant le temps écoulé depuis un timestamp de départ.
 *
 * @param {Object} props
 * @param {number} props.startTs - Timestamp de départ (Date.now())
 *
 * @returns {JSX.Element} Span contenant la durée formatée (ex : "2m34s")
 *
 * @example
 * <LiveTimer startTs={Date.now()} />
 */
export default function LiveTimer({ startTs }) {
    const [elapsed, setElapsed] = useState(() => Date.now() - startTs);

    useEffect(() => {
        const id = setInterval(() => {
            setElapsed(Date.now() - startTs);
        }, 1000);
        return () => clearInterval(id);
    }, [startTs]);

    return <span>{fmtMs(elapsed)}</span>;
}

LiveTimer.propTypes = {
    /** Timestamp unix de début de séance (millisecondes) */
    startTs: PropTypes.number.isRequired,
};
