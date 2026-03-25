/**
 * @file RodVisualizer — zone de visualisation des réglettes Cuisenaire.
 *
 * @description
 * Composant de présentation : aucun état interne, aucun handler.
 * Compose la bande blanche ("La partie →") et le fond ardoise
 * ("Le tout →" + zone d'accumulation ou décomposition explain).
 *
 * ────────────────────────────────────────────────────────────────
 * Structure visuelle
 * ────────────────────────────────────────────────────────────────
 *
 * Phases `count` et `name` :
 * ┌─────────────────────────────────────────┐  bande blanche
 * │  La partie →  [████ réglette part]      │
 * └─────────────────────────────────────────┘
 * ┌─────────────────────────────────────────┐  fond ardoise
 * │  Le tout →  [████████████ référence]    │
 * │             [████][████][              ]│  accumulation
 * └─────────────────────────────────────────┘
 *
 * Phase `explain` (non-unitaire) :
 * ┌─────────────────────────────────────────┐  fond ardoise seul
 * │  [████████████████████ orange]          │
 * │  [████████ violette]                    │
 * │  [████|████ 2 × rouge]                  │
 * │  La rouge vaut un cinquième...          │
 * └─────────────────────────────────────────┘
 *
 * ────────────────────────────────────────────────────────────────
 * Invariant géométrique
 * ────────────────────────────────────────────────────────────────
 * Pour toutes les situations unitaires :
 *   n × c.len × UNIT = c.refLen × UNIT
 *
 * Le spacer de 72px (label "Le tout →") est appliqué également
 * sur la zone d'accumulation pour garantir l'alignement gauche.
 *
 * ────────────────────────────────────────────────────────────────
 * Séparation visuelle
 * ────────────────────────────────────────────────────────────────
 * Le border-radius de DarkRod crée une encoche naturelle entre
 * réglettes adjacentes — aucun séparateur explicite nécessaire.
 *
 * @module RodVisualizer
 */

import PropTypes from "prop-types";
import { UNIT } from "../../../data/cuisenaire.js";
import DarkRod from "./DarkRod.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Couleur de fond ardoise */
const BAC_BG = "#1E293B";

/** Largeur du label latéral en px — identique bande blanche et ardoise */
const LABEL_W = 72;

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Zone de visualisation des réglettes pour l'atelier Cuisenaire.
 *
 * @param {Object}  props
 * @param {Object}  props.situation - Données de la situation (CUI[idx])
 * @param {number}  props.placed    - Réglettes posées dans la zone d'accumulation
 * @param {string}  props.phase     - Phase courante : 'count' | 'name' | 'explain'
 *
 * @returns {JSX.Element}
 */
export default function RodVisualizer({ situation: c, placed, phase }) {
    const rodW = c.refLen * UNIT;
    const minW = rodW + LABEL_W + 16; // largeur min pour éviter le clipping

    const isExplain = phase === "explain";

    return (
        <div className="rounded-2xl overflow-hidden shadow-sm">
            {/* ── Bande blanche : réglette modèle "La partie" ── */}
            {!isExplain && (
                <div className="bg-white px-4 py-2.5 flex items-center gap-3 border-b border-slate-100">
                    <span
                        className="text-xs font-bold text-slate-400 shrink-0"
                        style={{ width: `${LABEL_W}px`, textAlign: "right" }}
                    >
                        La partie →
                    </span>
                    <DarkRod len={c.len} bg={c.bg} bd={c.bd} />
                </div>
            )}

            {/* ── Fond ardoise ── */}
            <div
                style={{
                    background: BAC_BG,
                    padding: "16px",
                    overflowX: "auto",
                }}
                aria-label="Zone de comparaison des réglettes"
            >
                <div
                    className="flex flex-col gap-3"
                    style={{ minWidth: `${minW}px` }}
                >
                    {!isExplain ? (
                        <>
                            {/* Le tout — réglette de référence */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <span
                                    style={{
                                        width: `${LABEL_W}px`,
                                        textAlign: "right",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        color: "rgba(255,255,255,0.45)",
                                        flexShrink: 0,
                                    }}
                                >
                                    Le tout →
                                </span>
                                <DarkRod
                                    len={c.refLen}
                                    bg={c.refBg}
                                    bd={c.refBd}
                                />
                            </div>

                            {/*
                                Zone d'accumulation — flex row de DarkRod sans gap.
                                Le spacer de LABEL_W px aligne la zone sur "Le tout →".
                                Le border-radius de DarkRod assure la séparation visuelle.
                                L'espace vide est implicite par comparaison avec le tout.
                            */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <span
                                    style={{
                                        width: `${LABEL_W}px`,
                                        flexShrink: 0,
                                    }}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        minHeight: "36px",
                                    }}
                                    aria-label={
                                        placed === 0
                                            ? "Vide — ajouter des réglettes"
                                            : `${placed} réglette${placed > 1 ? "s" : ""}`
                                    }
                                >
                                    {Array.from({ length: placed }).map(
                                        (_, i) => (
                                            <DarkRod
                                                key={i}
                                                len={c.len}
                                                bg={c.bg}
                                                bd={c.bd}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ── Phase explain — décomposition non-unitaire ── */
                        <>
                            {/* Orange : le tout */}
                            <DarkRod len={c.refLen} bg={c.refBg} bd={c.refBd} />

                            {/* Violette : la fraction non-unitaire */}
                            <DarkRod len={c.len} bg={c.bg} bd={c.bd} />

                            {/*
                                2 rouges côte à côte sans gap.
                                border-radius assure la séparation visuelle —
                                la longueur totale = violette exactement.
                            */}
                            <div style={{ display: "flex" }}>
                                <DarkRod len={2} bg="#EF4444" bd="#B91C1C" />
                                <DarkRod len={2} bg="#EF4444" bd="#B91C1C" />
                            </div>

                            {/* Légende explicative */}
                            <p
                                style={{
                                    color: "rgba(255,255,255,0.45)",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    marginTop: "2px",
                                }}
                            >
                                La rouge vaut un cinquième de l'orange. Alors la
                                violette vaut _____ de l'orange.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

RodVisualizer.propTypes = {
    /** Données de la situation issue de cuisenaire.js */
    situation: PropTypes.shape({
        len: PropTypes.number.isRequired,
        bg: PropTypes.string.isRequired,
        bd: PropTypes.string.isRequired,
        refLen: PropTypes.number.isRequired,
        refBg: PropTypes.string.isRequired,
        refBd: PropTypes.string.isRequired,
        n: PropTypes.number, // null pour nonUnit
    }).isRequired,
    /** Réglettes posées dans la zone d'accumulation (0..c.n) */
    placed: PropTypes.number.isRequired,
    /** Phase courante — détermine la structure affichée */
    phase: PropTypes.oneOf(["count", "name", "explain"]).isRequired,
};
