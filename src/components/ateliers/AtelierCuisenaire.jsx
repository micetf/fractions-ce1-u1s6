/**
 * @file AtelierCuisenaire — atelier de fractions avec les réglettes Cuisenaire.
 *
 * @description
 * Orchestrateur de la séquence : gère l'état, les handlers et le rendu
 * de haut niveau. Les sous-composants sont délégués à :
 *
 * - DarkRod                : réglette atomique (via RodVisualizer)
 * - RodVisualizer          : zone de visualisation complète
 * - CuisenairePhaseCount   : UI manipulation + indice
 * - CuisenairePhaseName    : UI nommage (unitaire + non-unitaire)
 * - PhasePredict           : UI anticipation numérique (partagé)
 *
 * ────────────────────────────────────────────────────────────────
 * Flux des phases par type de situation
 * ────────────────────────────────────────────────────────────────
 *
 * Situations unitaires (nonUnit === false) :
 *   predict → count → name
 *
 * Situation non-unitaire (nonUnit === true) :
 *   explain → name
 *   (pas de predict ni de count — la manipulation est remplacée
 *   par une décomposition visuelle commentée par l'enseignant·e)
 *
 * ────────────────────────────────────────────────────────────────
 * Scoring
 * ────────────────────────────────────────────────────────────────
 * Situations unitaires   : 2 pts chacune (count + name)
 * Situation non-unitaire : 1 pt (name uniquement)
 * Total = CUI.length * 2 - 1 = 11 pts
 *
 * ────────────────────────────────────────────────────────────────
 * Note StrictMode
 * ────────────────────────────────────────────────────────────────
 * Contrairement à Tangram et Disques, le useEffect réinitialise
 * explicitement tous les états de situation car Cuisenaire a un
 * flux de phases conditionnel (nonUnit court-circuite predict/count).
 * Le risque StrictMode est géré différemment : handlePredict bascule
 * vers "count" après que le useEffect a établi "predict", donc
 * le double-invoke ne pose pas de problème ici car la situation
 * non-unitaire démarre directement en "explain" sans passer par
 * handlePredict.
 *
 * @see useEventLog
 */

import { useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";

import { CUI } from "../../data/cuisenaire.js";
import {
    okCountMsg,
    okNameMsg,
    errCountFew,
    errCountMany,
    errName1,
    errName2,
} from "../../utils/feedback.js";

import PhasePredict from "../ui/PhasePredict.jsx";
import ProgDots from "../ui/ProgDots.jsx";
import DoneScreen from "../ui/DoneScreen.jsx";
import FullModal from "../ui/FullModal.jsx";
import RodVisualizer from "./cuisenaire/RodVisualizer.jsx";
import CuisenairePhaseCount from "./cuisenaire/CuisenairePhaseCount.jsx";
import CuisenairePhaseName from "./cuisenaire/CuisenairePhaseName.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

const COLOR = "#B45309";
const MAX_SCORE = CUI.length * 2 - 1;

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Atelier Cuisenaire — séquence de 6 situations de fractions des réglettes.
 *
 * @param {Object}   props
 * @param {Function} props.log - Émetteur d'événements pédagogiques
 */
export default function AtelierCuisenaire({ log }) {
    const [idx, setIdx] = useState(0);
    const [placed, setPlaced] = useState(0);
    const [phase, setPhase] = useState("predict");
    const [predicted, setPredicted] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [locked, setLocked] = useState(false);
    const [showFullModal, setShowFullModal] = useState(false);
    const [nameErr, setNameErr] = useState(0);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const sitStart = useRef(Date.now());
    const countErrCount = useRef(0);

    const c = CUI[idx];

    // ── Cycle de vie situation ───────────────────────────────────────────────────

    /*
     * Cuisenaire réinitialise tous les états dans useEffect (contrairement
     * à Tangram/Disques) car le flux de phases est conditionnel :
     * - nonUnit → démarre en "explain" (pas de predict ni count)
     * - unitaire → démarre en "predict"
     * Le double-invoke StrictMode ne pose pas de problème ici car
     * handlePredict n'est jamais appelé sur une situation nonUnit.
     */
    useEffect(() => {
        sitStart.current = Date.now();
        countErrCount.current = 0;
        setPlaced(0);
        setPhase(c.nonUnit ? "explain" : "predict");
        setPredicted(null);
        setFeedback(null);
        setLocked(false);
        setNameErr(0);
        setShowFullModal(false);
        log("SIT_START", {
            idx,
            id: `cu${idx}`,
            label: `Réglette ${c.name} / ${c.refName}`,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

    // ── Reset complet ────────────────────────────────────────────────────────────

    const reset = useCallback(() => {
        setIdx(0);
        setScore(0);
        setDone(false);
        // Les autres états seront réinitialisés par le useEffect au changement d'idx
    }, []);

    // ── Avancement situation ─────────────────────────────────────────────────────

    const doAdvance = useCallback(
        (finalNameErr) => {
            const dur = Date.now() - sitStart.current;
            const isFullScore =
                (c.nonUnit || countErrCount.current === 0) &&
                finalNameErr === 0;

            log("SIT_DONE", {
                idx,
                label: `${c.name} / ${c.refName}`,
                n: c.n,
                answer: c.answer,
                predictCorrect: c.nonUnit ? null : predicted === c.n,
                countErrors: c.nonUnit ? null : countErrCount.current,
                nameErrors: finalNameErr,
                durationMs: dur,
                fullScore: isFullScore,
            });

            const next = idx + 1;
            if (next < CUI.length) {
                setIdx(next);
                // Tous les autres états réinitialisés par useEffect
            } else {
                setDone(true);
                log("ATELIER_DONE", {
                    totalScore: score,
                    maxScore: MAX_SCORE,
                    durationMs: dur,
                });
            }
        },
        [idx, c, score, predicted, log]
    );

    // ── Handler PREDICT ──────────────────────────────────────────────────────────

    /**
     * Enregistre la prédiction et bascule en phase count.
     * Uniquement pour les situations unitaires.
     *
     * @param {number} value - Valeur choisie (1–10)
     */
    const handlePredict = useCallback(
        (value) => {
            setPredicted(value);
            log("PREDICT", {
                idx,
                predicted: value,
                actual: c.n,
                correct: value === c.n,
            });
            setPhase("count");
        },
        [idx, c.n, log]
    );

    // ── Handlers COUNT ───────────────────────────────────────────────────────────

    /** Ajouter : modale si la réglette de référence est déjà couverte. */
    const handleAdd = useCallback(() => {
        if (placed >= c.n) {
            setShowFullModal(true);
        } else {
            setPlaced((p) => p + 1);
        }
        setFeedback(null);
    }, [placed, c.n]);

    const handleRemove = useCallback(() => {
        setPlaced((p) => Math.max(p - 1, 0));
        setFeedback(null);
    }, []);

    /**
     * Valide le comptage et construit le feedback en intégrant la
     * correction de prédiction.
     *
     * Cas ok/warn (manipulation réussie) :
     * - predicted === null  → message générique (okCountMsg)
     * - predicted === c.n   → confirmation + félicitation (ok)
     * - predicted !== c.n   → correction sans pénalité (warn)
     */
    const handleValidateCount = useCallback(() => {
        if (placed === c.n) {
            setScore((s) => s + 1);
            log("COUNT_OK", { idx, countErrors: countErrCount.current });

            let msg;
            let type;

            if (predicted === null) {
                msg = okCountMsg(
                    c.n,
                    `réglette ${c.name}`,
                    `réglette ${c.refName}`
                );
                type = "ok";
            } else if (predicted === c.n) {
                msg = `Tu avais prédit ${c.n} — c'est exact ! Maintenant, nomme la fraction.`;
                type = "ok";
            } else {
                msg = `Tu avais dit ${predicted}, mais en ajoutant tu as trouvé ${c.n}. C'est ça qui compte !`;
                type = "warn";
            }

            setFeedback({ type, msg });
        } else {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed, expected: c.n });
            setFeedback({
                type: "err",
                msg:
                    placed < c.n
                        ? errCountFew(placed, c.n)
                        : errCountMany(placed, c.n),
            });
        }
    }, [placed, c, idx, predicted, log]);

    // ── Handlers NAME ─────────────────────────────────────────────────────────────

    const handleSelectName = useCallback(
        (opt) => {
            if (locked) return;

            if (opt === c.answer) {
                setLocked(true);
                setScore((s) => s + 1);
                log("NAME_OK", { idx, nameErrors: nameErr });

                const msg = c.nonUnit
                    ? `Réglette violette = 2 × rouge = 2 × un cinquième → c'est bien «deux cinquièmes» de l'orange.`
                    : okNameMsg(
                          c.n,
                          `réglette ${c.name}`,
                          `réglette ${c.refName}`,
                          c.answer
                      );

                setFeedback({ type: "ok", msg });
            } else {
                const ne = nameErr + 1;
                setNameErr(ne);
                log("NAME_ERR", {
                    idx,
                    chosen: opt,
                    answer: c.answer,
                    errN: ne,
                });

                const msg = c.nonUnit
                    ? ne === 1
                        ? `La violette = 2 rouges. La rouge est un cinquième. 2 fois un cinquième = ?`
                        : `Réglette violette = 2 × un cinquième = «deux cinquièmes».`
                    : ne === 1
                      ? errName1(c.n, `réglette ${c.name}`)
                      : errName2(c.n);

                setFeedback({ type: "err", msg });
            }
        },
        [locked, c, nameErr, idx, log]
    );

    // ── Continuations ─────────────────────────────────────────────────────────────

    const handleCountContinue = useCallback(() => {
        setPhase("name");
        setFeedback(null);
    }, []);

    const handleNameContinue = useCallback(() => {
        doAdvance(nameErr);
    }, [doAdvance, nameErr]);

    // ── Rendu ─────────────────────────────────────────────────────────────────────

    if (done) {
        return (
            <DoneScreen
                score={score}
                max={MAX_SCORE}
                label="Cuisenaire"
                onReset={reset}
                color={COLOR}
            />
        );
    }

    const isPredict = phase === "predict";
    const isCount = phase === "count";
    const isExplain = phase === "explain";
    const isNaming = phase === "name";

    return (
        <div className="flex flex-col gap-4">
            {/* ── Progression ── */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {idx + 1}/{CUI.length}
                </span>
                <ProgDots done={score} total={MAX_SCORE} color={COLOR} />
            </div>

            {/* ── Consigne — count, name et explain uniquement.
                   Phase predict : PhasePredict porte sa consigne via prop. ── */}
            {!isPredict && (
                <div
                    className="bg-amber-50 border border-amber-100 rounded-2xl p-3
                               text-center text-lg font-bold text-amber-900 leading-snug"
                >
                    {isCount && (
                        <>
                            Vérifie en ajoutant les réglettes{" "}
                            <em
                                className="not-italic font-extrabold"
                                style={{
                                    color:
                                        c.bg === "#F9FAFB" ? "#6B7280" : c.bg,
                                }}
                            >
                                {c.name}
                            </em>{" "}
                            une à une.
                        </>
                    )}
                    {isNaming && (
                        <>
                            La réglette{" "}
                            <em
                                className="not-italic font-extrabold"
                                style={{
                                    color:
                                        c.bg === "#F9FAFB" ? "#6B7280" : c.bg,
                                }}
                            >
                                {c.name}
                            </em>{" "}
                            représente _____ de la réglette{" "}
                            <em
                                className="not-italic font-extrabold"
                                style={{ color: c.refBg }}
                            >
                                {c.refName}
                            </em>
                            .
                        </>
                    )}
                    {isExplain && (
                        <>
                            ★ Défi — La réglette{" "}
                            <em
                                className="not-italic font-extrabold"
                                style={{ color: c.bg }}
                            >
                                violette
                            </em>{" "}
                            représente _____ de la réglette{" "}
                            <em
                                className="not-italic font-extrabold"
                                style={{ color: c.refBg }}
                            >
                                orange
                            </em>
                            .
                        </>
                    )}
                </div>
            )}

            {/* ── Visualisation réglettes ── */}
            <RodVisualizer situation={c} placed={placed} phase={phase} />

            {/* ── Phase active ── */}

            {isPredict && (
                <PhasePredict
                    consigne={
                        <>
                            Combien de réglettes{" "}
                            <em
                                className="not-italic font-extrabold"
                                style={{
                                    color:
                                        c.bg === "#F9FAFB" ? "#6B7280" : c.bg,
                                }}
                            >
                                {c.name}
                            </em>{" "}
                            faut-il pour couvrir la réglette{" "}
                            <em
                                className="not-italic font-extrabold"
                                style={{ color: c.refBg }}
                            >
                                {c.refName}
                            </em>{" "}
                            ?
                        </>
                    }
                    onPredict={handlePredict}
                    color={COLOR}
                />
            )}

            {isCount && (
                <CuisenairePhaseCount
                    situation={c}
                    placed={placed}
                    feedback={feedback}
                    onContinue={handleCountContinue}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onValidate={handleValidateCount}
                />
            )}

            {(isNaming || isExplain) && (
                <CuisenairePhaseName
                    situation={c}
                    feedback={feedback}
                    onContinue={handleNameContinue}
                    onSelect={handleSelectName}
                />
            )}

            {/* ── Modale "réglette déjà couverte" ── */}
            {showFullModal && (
                <FullModal
                    message={`La réglette ${c.refName} est déjà couverte ! Il n'est plus nécessaire d'ajouter.`}
                    color={COLOR}
                    onClose={() => setShowFullModal(false)}
                />
            )}
        </div>
    );
}

AtelierCuisenaire.propTypes = {
    log: PropTypes.func.isRequired,
};
