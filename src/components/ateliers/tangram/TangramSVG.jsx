/**
 * @file TangramSVG — rendu SVG du carré Tangram progressivement rempli.
 *
 * @description
 * Composant de présentation pur : aucun état, aucun handler.
 * Reçoit la situation et le nombre de pièces posées, rend le SVG.
 *
 * ────────────────────────────────────────────────────────────────
 * Modèle de remplissage
 * ────────────────────────────────────────────────────────────────
 * placed=0 → carré vide (fantômes très atténués, opacity 0.12).
 * placed=s.n → carré entièrement rempli.
 * Ordre de remplissage : [active, ...ghosts] — la pièce de référence
 * (active) est toujours posée en premier.
 *
 * @module TangramSVG
 */

import PropTypes from "prop-types";

/**
 * Carré Tangram progressivement rempli pièce par pièce.
 *
 * @param {Object}  props
 * @param {Object}  props.situation - Données de la situation (TG[idx])
 * @param {number}  props.placed    - Nombre de pièces posées (0..s.n)
 * @param {number}  [props.size=200] - Taille CSS en pixels
 *
 * @returns {JSX.Element}
 */
export default function TangramSVG({ situation: s, placed, size = 200 }) {
    const allPieces = [s.active, ...s.ghosts]; // longueur = s.n

    return (
        <svg
            viewBox="0 0 200 200"
            aria-label={`Carré Tangram — ${placed} pièce${placed > 1 ? "s" : ""} posée${placed > 1 ? "s" : ""}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                filter: "drop-shadow(0 4px 14px rgba(0,0,0,.12))",
            }}
        >
            {/* Fond du carré */}
            <rect
                x="10"
                y="10"
                width="180"
                height="180"
                fill="#F8FAFC"
                rx="2"
            />

            {/* Pièces : colorées si posées, fantômes atténués sinon */}
            {allPieces.map((pts, i) => (
                <polygon
                    key={i}
                    points={pts}
                    fill={i < placed ? s.color : s.ghostC}
                    opacity={i < placed ? 0.85 : 0.12}
                    stroke="white"
                    strokeWidth="1.5"
                />
            ))}

            {/* Contour du carré */}
            <rect
                x="10"
                y="10"
                width="180"
                height="180"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2"
                rx="2"
            />
        </svg>
    );
}

TangramSVG.propTypes = {
    /** Données de la situation issue de tangram.js */
    situation: PropTypes.shape({
        color: PropTypes.string.isRequired,
        ghostC: PropTypes.string.isRequired,
        active: PropTypes.string.isRequired,
        ghosts: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    /** Nombre de pièces posées (0..s.n) */
    placed: PropTypes.number.isRequired,
    /** Taille CSS en pixels (largeur = hauteur) */
    size: PropTypes.number,
};
