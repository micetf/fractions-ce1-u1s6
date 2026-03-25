/**
 * @file DarkRod — réglette Cuisenaire individuelle sur fond ardoise.
 *
 * @description
 * Composant atomique de présentation : aucun état, aucun handler.
 * Représente une réglette Cuisenaire par sa largeur proportionnelle
 * à sa longueur en unités (UNIT px par unité).
 *
 * Utilisé systématiquement pour :
 * - La réglette de référence "Le tout →" (zone ardoise)
 * - La réglette modèle "La partie →" (bande blanche)
 * - Les réglettes accumulées dans la zone de vérification
 * - Les réglettes de la phase explain
 *
 * ────────────────────────────────────────────────────────────────
 * Séparation visuelle
 * ────────────────────────────────────────────────────────────────
 * Le border-radius (6px) assure une encoche naturelle entre deux
 * DarkRod adjacentes placées dans un flex row sans gap.
 * Aucun séparateur explicite n'est nécessaire.
 *
 * ────────────────────────────────────────────────────────────────
 * Valeur numérique
 * ────────────────────────────────────────────────────────────────
 * Conformément au principe fondateur du matériel Cuisenaire,
 * aucune valeur numérique n'est inscrite sur la réglette.
 * La longueur visuelle est la valeur.
 *
 * @module DarkRod
 */

import PropTypes from "prop-types";
import { UNIT } from "../../../data/cuisenaire.js";

/**
 * Réglette individuelle sur fond ardoise.
 *
 * @param {Object} props
 * @param {number} props.len - Longueur en unités (1..10)
 * @param {string} props.bg  - Couleur de fond (hex)
 * @param {string} props.bd  - Couleur de bordure (hex)
 *
 * @returns {JSX.Element}
 */
export default function DarkRod({ len, bg, bd }) {
    return (
        <div
            style={{
                width: `${len * UNIT}px`,
                height: "36px",
                background: bg,
                border: `2px solid ${bd}`,
                borderRadius: "6px",
                flexShrink: 0,
            }}
        />
    );
}

DarkRod.propTypes = {
    /** Longueur de la réglette en unités Cuisenaire (1..10) */
    len: PropTypes.number.isRequired,
    /** Couleur de fond (hex) */
    bg: PropTypes.string.isRequired,
    /** Couleur de bordure (hex) */
    bd: PropTypes.string.isRequired,
};
