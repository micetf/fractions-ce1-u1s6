/**
 * @file DisqueSVG — rendu SVG du disque progressivement rempli part par part.
 *
 * @description
 * Composant de présentation pur : aucun handler, pas d'état propre.
 * Reçoit la situation et le nombre de parts posées, rend le SVG.
 *
 * ────────────────────────────────────────────────────────────────
 * Ordre de remplissage
 * ────────────────────────────────────────────────────────────────
 * La part d'index `d.ai` est toujours coloriée en premier — elle
 * correspond à la part de référence affichée dans le modèle.
 * Les autres parts sont ensuite remplies dans l'ordre des index SVG.
 *
 * placed=0 → disque entièrement vide (gris atténué).
 * placed=d.n → disque entièrement rempli.
 *
 * ────────────────────────────────────────────────────────────────
 * Invariant géométrique
 * ────────────────────────────────────────────────────────────────
 * Toutes les parts ont le même angle : 360 / d.n degrés.
 * Le point central est matérialisé par un petit cercle blanc (r=4).
 *
 * @module DisqueSVG
 */

import { useMemo } from "react";
import PropTypes from "prop-types";
import { arc } from "../../../utils/svg.js";

// ─── Constantes géométriques ───────────────────────────────────────────────────

const RADIUS = 85;
const CENTER = 100;

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Disque Cuisenaire progressivement rempli part par part.
 *
 * @param {Object}  props
 * @param {Object}  props.situation  - Données de la situation (DQ[idx])
 * @param {number}  props.placed     - Nombre de parts coloriées (0..d.n)
 * @param {number}  [props.size=200] - Taille CSS en pixels
 *
 * @returns {JSX.Element}
 */
export default function DisqueSVG({ situation: d, placed, size = 200 }) {
    const step = 360 / d.n;

    /*
     * Ordre de remplissage : part ai en tête (= part de référence),
     * puis les autres index dans l'ordre naturel.
     * Mémoïsé car ne dépend que de d.n et d.ai.
     */
    const fillOrder = useMemo(
        () => [
            d.ai,
            ...Array.from({ length: d.n }, (_, k) => k).filter(
                (k) => k !== d.ai
            ),
        ],
        [d.n, d.ai]
    );

    return (
        <svg
            viewBox="0 0 200 200"
            aria-label={`Disque divisé en ${d.n} parts égales, ${placed} coloriée${placed > 1 ? "s" : ""}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                filter: "drop-shadow(0 4px 14px rgba(0,0,0,.12))",
            }}
        >
            {/* Fond blanc du disque */}
            <circle cx={CENTER} cy={CENTER} r={88} fill="white" />

            {/* Parts — colorées si placées, grisées sinon */}
            {Array.from({ length: d.n }).map((_, i) => {
                const isPlaced = fillOrder.indexOf(i) < placed;
                return (
                    <path
                        key={i}
                        d={arc(
                            CENTER,
                            CENTER,
                            RADIUS,
                            i * step,
                            (i + 1) * step
                        )}
                        fill={isPlaced ? d.color : "#E2E8F0"}
                        opacity={isPlaced ? 0.85 : 0.4}
                        stroke="white"
                        strokeWidth="1.5"
                    />
                );
            })}

            {/* Contour du disque */}
            <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.5"
            />

            {/* Point central */}
            <circle cx={CENTER} cy={CENTER} r={4} fill="white" />
        </svg>
    );
}

DisqueSVG.propTypes = {
    /** Données de la situation issue de disques.js */
    situation: PropTypes.shape({
        n: PropTypes.number.isRequired,
        ai: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired,
    }).isRequired,
    /** Nombre de parts coloriées (0..d.n) */
    placed: PropTypes.number.isRequired,
    /** Taille CSS en pixels (largeur = hauteur) */
    size: PropTypes.number,
};
