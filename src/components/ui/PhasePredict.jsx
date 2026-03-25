/**
 * @file PhasePredict — phase d'anticipation avant la manipulation.
 *
 * @description
 * L'élève formule une hypothèse sur le nombre de parts/pièces/réglettes
 * nécessaires pour remplir le tout, AVANT de le vérifier par manipulation
 * en phase `count`.
 *
 * ────────────────────────────────────────────────────────────────
 * Intention didactique
 * ────────────────────────────────────────────────────────────────
 * Cycle anticipation → vérification → nomination (Brousseau).
 * La prédiction engage la mémoire de travail sur une valeur concrète,
 * ce qui rend l'erreur de comptage diagnostiquement informative.
 *
 * ────────────────────────────────────────────────────────────────
 * UX
 * ────────────────────────────────────────────────────────────────
 * 10 boutons numérotés 1–10, organisés en 2 lignes de 5.
 * Un seul clic → transition immédiate vers `count`.
 * Pas de bouton de validation — la sélection est l'engagement.
 *
 * ────────────────────────────────────────────────────────────────
 * Pas de feedback visuel immédiat
 * ────────────────────────────────────────────────────────────────
 * La phase `count` est la seule source de vérité. Révéler si la
 * prédiction est juste avant la manipulation viderait l'intérêt
 * du geste de vérification.
 *
 * @module PhasePredict
 */

import PropTypes from "prop-types";

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Valeurs proposées : 1 à 10, couvrant tous les dénominateurs de la séquence */
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Phase d'anticipation — l'élève prédit le nombre de parts avant de compter.
 *
 * @param {Object}   props
 * @param {string}   props.color     - Couleur thématique de l'atelier (hex)
 * @param {string}   props.consigne  - Texte de la consigne affiché au-dessus des boutons
 * @param {Function} props.onSelect  - Callback(predicted: number) — déclenché au clic
 *
 * @returns {JSX.Element}
 */
export default function PhasePredict({ consigne, onPredict, color }) {
    return (
        <div className="flex flex-col gap-4">
            {/* Consigne fournie par l'atelier appelant */}
            <div
                className="rounded-2xl p-3 text-center text-lg font-bold leading-snug"
                style={{
                    background: `${color}18`,
                    border: `1.5px solid ${color}33`,
                    color,
                }}
            >
                {consigne}
            </div>

            {/* Grille 1–10 */}
            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
                role="group"
                aria-label="Choisir un nombre"
            >
                {VALUES.map((v) => (
                    <button
                        key={v}
                        onClick={() => onPredict(v)}
                        aria-label={`${v}`}
                        className="rounded-2xl py-4 text-2xl font-extrabold
                                   shadow-sm border-2 transition-all
                                   hover:brightness-95 active:scale-95
                                   touch-manipulation"
                        style={{
                            background: "white",
                            borderColor: `${color}44`,
                            color,
                        }}
                    >
                        {v}
                    </button>
                ))}
            </div>
        </div>
    );
}

PhasePredict.propTypes = {
    consigne: PropTypes.node.isRequired,
    onPredict: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
};
