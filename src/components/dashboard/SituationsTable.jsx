/**
 * @file SituationsTable — tableau détaillé par situation terminée.
 *
 * @description
 * Composant de présentation pur : aucun état, aucun handler.
 * Affiche une ligne par situation terminée avec :
 * - Prédiction  : ✓ / ✗ / — (nonUnit ou absent)
 * - Nommage     : ✓ / N×err
 * - Durée       : formatée via fmtMs
 *
 * ────────────────────────────────────────────────────────────────
 * Colonne Prédiction
 * ────────────────────────────────────────────────────────────────
 * Remplace l'ancienne colonne "Comptage" dont la valeur diagnostique
 * était faible (l'élève ne pouvait pas valider sans que le disque /
 * carré soit visuellement plein).
 *
 * - predictCorrect === true  → ✓ vert
 * - predictCorrect === false → ✗ ambre (manipulation réussie mais
 *                               anticipation inexacte — pas une faute)
 * - predictCorrect === null  → — (situation nonUnit sans phase predict)
 *
 * ────────────────────────────────────────────────────────────────
 * Couleurs de ligne
 * ────────────────────────────────────────────────────────────────
 * - perfect   → vert pâle  (#F0FDF4)
 * - good      → ambre pâle (#FFFBEB)
 * - struggled → orange pâle (#FFF7ED)
 *
 * @module SituationsTable
 */

import PropTypes from "prop-types";
import { fmtMs } from "../../utils/time.js";

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Couleur de fond par statut */
const ROW_BG = {
    perfect: "#F0FDF4",
    good: "#FFFBEB",
    struggled: "#FFF7ED",
};

// ─── Sous-composant : cellule prédiction ────────────────────────────────────────

/**
 * Cellule de la colonne Prédiction.
 *
 * @param {{ predictCorrect: boolean|null }} props
 */
function PredictCell({ predictCorrect }) {
    if (predictCorrect === null) {
        return <span className="text-slate-300 text-xs">—</span>;
    }
    if (predictCorrect) {
        return <span className="text-emerald-600 font-bold">✓</span>;
    }
    return <span className="text-amber-600 font-bold text-xs">✗</span>;
}

PredictCell.propTypes = {
    predictCorrect: PropTypes.bool,
};

PredictCell.defaultProps = {
    predictCorrect: null,
};

// ─── Sous-composant : cellule nommage ──────────────────────────────────────────

/**
 * Cellule de la colonne Nommage.
 *
 * @param {{ nameErrors: number }} props
 */
function NameCell({ nameErrors }) {
    if (nameErrors === 0) {
        return <span className="text-emerald-600 font-bold">✓</span>;
    }
    return (
        <span className="text-amber-600 font-bold text-xs">
            {nameErrors}×err
        </span>
    );
}

NameCell.propTypes = {
    nameErrors: PropTypes.number.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Tableau détaillé par situation terminée.
 *
 * @param {Object} props
 * @param {Array}  props.done - Situations terminées issues de useSituationStats
 *
 * @returns {JSX.Element|null} — null si aucune situation terminée
 */
export default function SituationsTable({ done }) {
    if (done.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-4 mb-3">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-3">
                Détail par situation
            </p>

            <div className="overflow-x-auto">
                <table
                    className="w-full text-sm"
                    style={{
                        borderCollapse: "separate",
                        borderSpacing: "0 4px",
                    }}
                >
                    <thead>
                        <tr className="text-xs font-bold text-slate-400 uppercase">
                            <th className="text-left pb-2 pr-2">Situation</th>
                            <th className="text-center pb-2 px-2">
                                Prédiction
                            </th>
                            <th className="text-center pb-2 px-2">Nommage</th>
                            <th className="text-center pb-2 px-2">Durée</th>
                        </tr>
                    </thead>

                    <tbody>
                        {done.map((s) => (
                            <tr
                                key={s.idx}
                                style={{
                                    background:
                                        ROW_BG[s.status] ?? ROW_BG.struggled,
                                }}
                            >
                                {/* Libellé de la situation */}
                                <td
                                    className="py-2 px-2 font-semibold text-slate-700
                                               rounded-l-xl text-xs"
                                    style={{ maxWidth: "100px" }}
                                >
                                    {s.label}
                                </td>

                                {/* Prédiction */}
                                <td className="py-2 px-2 text-center">
                                    <PredictCell
                                        predictCorrect={s.predictCorrect}
                                    />
                                </td>

                                {/* Nommage */}
                                <td className="py-2 px-2 text-center">
                                    <NameCell nameErrors={s.nameErrors} />
                                </td>

                                {/* Durée */}
                                <td
                                    className="py-2 px-2 text-center text-slate-500
                                               text-xs rounded-r-xl"
                                >
                                    {fmtMs(s.durationMs)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

SituationsTable.propTypes = {
    /** Situations terminées issues de useSituationStats */
    done: PropTypes.arrayOf(
        PropTypes.shape({
            idx: PropTypes.number.isRequired,
            label: PropTypes.string.isRequired,
            status: PropTypes.oneOf(["perfect", "good", "struggled"])
                .isRequired,
            predictCorrect: PropTypes.bool,
            nameErrors: PropTypes.number.isRequired,
            durationMs: PropTypes.number,
        })
    ).isRequired,
};
