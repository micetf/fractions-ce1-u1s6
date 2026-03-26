/**
 * @file AtelierDisques — atelier de fractions avec les parts du disque.
 *
 * @description
 * Orchestrateur de la séquence : gère l'état, les handlers et le rendu
 * de haut niveau. Les sous-composants sont délégués à :
 *
 * - DisqueSVG           : rendu SVG du disque
 * - DisquesPhaseCount   : UI de vérification par manipulation
 * - DisquesPhaseName    : UI de nommage de la fraction
 * - PhasePredict        : UI d'anticipation numérique (partagé)
 *
 * ────────────────────────────────────────────────────────────────
 * Flux des phases par situation
 * ────────────────────────────────────────────────────────────────
 *
 *   predict → count → name
 *
 * 1. **predict** — L'élève anticipe le nombre de parts nécessaires
 *    (boutons 1–10). Aucun feedback immédiat. La consigne est portée
 *    par PhasePredict via la prop `consigne`.
 *
 * 2. **count**   — L'élève vérifie par manipulation. Le feedback
 *    intègre la correction de prédiction :
 *    - `ok`   : prédiction juste ou absente
 *    - `warn` : manipulation réussie, prédiction inexacte
 *
 * 3. **name**    — L'élève nomme la fraction parmi 4 options générées
 *    dynamiquement via useMemo depuis FNAME.
 *
 * ────────────────────────────────────────────────────────────────
 * Options de nommage
 * ────────────────────────────────────────────────────────────────
 * Générées aléatoirement à chaque situation : 1 correcte + 3 distracteurs
 * tirés de FNAME, mélangés. Recalculées à chaque changement de d.n.
 *
 * ────────────────────────────────────────────────────────────────
 * Scoring
 * ────────────────────────────────────────────────────────────────
 * +1 par phase réussie — max 2 pts/situation = 14 pts total.
 *
 * ────────────────────────────────────────────────────────────────
 * Note StrictMode
 * ────────────────────────────────────────────────────────────────
 * `setPhase` et `setPredicted` sont intentionnellement absents du
 * useEffect pour éviter que le double-invoke de StrictMode en
 * développement ne remette phase à "predict" après que handlePredict
 * l'ait basculée à "count". Ils sont réinitialisés dans doAdvance.
 *
 * @see useEventLog
 */

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import { DQ } from "../../data/disques.js";
import {
    FNAME,
    okCountMsg,
    okNameMsg,
    errCountFew,
    errCountMany,
    errName1,
    errName2,
} from "../../utils/feedback.js";
import { arc } from "../../utils/svg.js";

import PhasePredict from "../ui/PhasePredict.jsx";
import ProgDots from "../ui/ProgDots.jsx";
import DoneScreen from "../ui/DoneScreen.jsx";
import FullModal from "../ui/FullModal.jsx";
import DisqueSVG from "./disques/DisqueSVG.jsx";
import DisquesPhaseCount from "./disques/DisquesPhaseCount.jsx";
import DisquesPhaseName from "./disques/DisquesPhaseName.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

const COLOR = "#7C3AED";
const MAX_SCORE = DQ.length * 2;
const RADIUS = 85;
const CENTER = 100;

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Atelier Disques — séquence de 7 situations de fractions du disque.
 *
 * @param {Object}   props
 * @param {Function} props.log - Émetteur d'événements pédagogiques
 */
export default function AtelierDisques({ log, onDone, onPrint }) {
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

    const d = DQ[idx];

    // ── Cycle de vie situation ───────────────────────────────────────────────────

    useEffect(() => {
        sitStart.current = Date.now();
        countErrCount.current = 0;
        log("SIT_START", { idx, id: `dq${idx}`, label: `Disque ÷${d.n}` });
        // phase et predicted réinitialisés dans doAdvance — voir note StrictMode
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

    // ── Options de nommage — recalculées à chaque situation ─────────────────────

    const nameOpts = useMemo(() => {
        const correct = FNAME[d.n];
        const others = [2, 3, 4, 5, 6, 8, 10]
            .filter((k) => k !== d.n)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((k) => FNAME[k]);
        return [correct, ...others].sort(() => Math.random() - 0.5);
    }, [d.n]);

    // ── Reset complet ────────────────────────────────────────────────────────────

    const reset = useCallback(() => {
        setIdx(0);
        setPlaced(0);
        setPhase("predict");
        setPredicted(null);
        setFeedback(null);
        setLocked(false);
        setShowFullModal(false);
        setNameErr(0);
        setScore(0);
        setDone(false);
    }, []);

    // ── Avancement situation ─────────────────────────────────────────────────────

    const doAdvance = useCallback(
        (finalNameErr) => {
            const dur = Date.now() - sitStart.current;
            const isFullScore =
                countErrCount.current === 0 && finalNameErr === 0;

            log("SIT_DONE", {
                idx,
                label: `Disque ÷${d.n}`,
                n: d.n,
                answer: FNAME[d.n],
                predictCorrect: predicted === d.n,
                countErrors: countErrCount.current,
                nameErrors: finalNameErr,
                durationMs: dur,
                fullScore: isFullScore,
            });

            const next = idx + 1;
            if (next < DQ.length) {
                setIdx(next);
                setPlaced(0);
                setPhase("predict"); // réinitialisation explicite — pas dans useEffect
                setPredicted(null); // réinitialisation explicite — pas dans useEffect
                setFeedback(null);
                setLocked(false);
                setNameErr(0);
            } else {
                setDone(true);
                log("ATELIER_DONE", {
                    totalScore: score,
                    maxScore: MAX_SCORE,
                    durationMs: dur,
                });
            }
        },
        [idx, d, score, predicted, log]
    );

    // ── Handler PREDICT ──────────────────────────────────────────────────────────

    /**
     * Enregistre la prédiction et bascule en phase count.
     * Aucun feedback : la phase count est l'unique source de vérité.
     *
     * @param {number} value - Valeur choisie (1–10)
     */
    const handlePredict = useCallback(
        (value) => {
            setPredicted(value);
            log("PREDICT", {
                idx,
                predicted: value,
                actual: d.n,
                correct: value === d.n,
            });
            setPhase("count");
        },
        [idx, d.n, log]
    );

    // ── Handlers COUNT ───────────────────────────────────────────────────────────

    /** Ajouter : modale si le disque est déjà plein. */
    const handleAdd = useCallback(() => {
        if (placed >= d.n) {
            setShowFullModal(true);
        } else {
            setPlaced((p) => p + 1);
        }
        setFeedback(null);
    }, [placed, d.n]);

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
     * - predicted === d.n   → confirmation + félicitation (ok)
     * - predicted !== d.n   → correction sans pénalité (warn)
     */
    const handleValidateCount = useCallback(() => {
        if (placed === d.n) {
            setScore((s) => s + 1);
            log("COUNT_OK", { idx, countErrors: countErrCount.current });

            let msg;
            let type;

            if (predicted === null) {
                msg = okCountMsg(d.n, "part", "disque");
                type = "ok";
            } else if (predicted === d.n) {
                msg = `Tu avais prédit ${d.n} — c'est exact ! Maintenant, nomme la fraction.`;
                type = "ok";
            } else {
                msg = `Tu avais dit ${predicted}, mais en ajoutant tu as trouvé ${d.n}. C'est ça qui compte !`;
                type = "warn";
            }

            setFeedback({ type, msg });
        } else if (placed < d.n) {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed, expected: d.n });
            setFeedback({ type: "err", msg: errCountFew(placed, d.n) });
        } else {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed, expected: d.n });
            setFeedback({ type: "err", msg: errCountMany(placed, d.n) });
        }
    }, [placed, d, idx, predicted, log]);

    // ── Handlers NAME ─────────────────────────────────────────────────────────────

    const handleSelectName = useCallback(
        (opt) => {
            if (locked) return;

            const ans = FNAME[d.n];
            if (opt === ans) {
                setLocked(true);
                setScore((s) => s + 1);
                log("NAME_OK", { idx, nameErrors: nameErr });
                setFeedback({
                    type: "ok",
                    msg: okNameMsg(d.n, "part", "disque", ans),
                });
            } else {
                const ne = nameErr + 1;
                setNameErr(ne);
                log("NAME_ERR", { idx, chosen: opt, answer: ans, errN: ne });
                setFeedback({
                    type: "err",
                    msg: ne === 1 ? errName1(d.n, "parts") : errName2(d.n),
                });
            }
        },
        [locked, d, nameErr, idx, log]
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
                label="Disques"
                onReset={reset}
                onDone={onDone}
                onPrint={onPrint}
                color={COLOR}
            />
        );
    }

    const isPredict = phase === "predict";
    const isCount = phase === "count";

    return (
        <div className="flex flex-col gap-4">
            {/* ── Progression ── */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {idx + 1}/{DQ.length}
                </span>
                <ProgDots done={score} total={MAX_SCORE} color={COLOR} />
            </div>

            {/* ── Consigne — count et name uniquement.
                   Phase predict : PhasePredict porte sa consigne via prop. ── */}
            {!isPredict && (
                <div
                    className="bg-purple-50 border border-purple-100 rounded-2xl p-3
                               text-center text-lg font-bold text-purple-900 leading-snug"
                >
                    {isCount
                        ? "Vérifie en ajoutant les parts une à une."
                        : "Cette part représente _____ du disque."}
                </div>
            )}

            {/* ── Visualisation : disque à remplir + modèle de la part ── */}
            {/*
                Les deux SVGs partagent viewBox="0 0 200 200" et size=150px CSS.
                150 + 150 + gap ≈ 316px → tient sur un écran 375px.
                La part modèle est tournée de d.rot° autour du centre pour éviter
                toute orientation prototypique.
            */}
            <div className="flex items-end justify-center gap-4">
                {/* Le disque à remplir progressivement */}
                <div className="flex flex-col items-center gap-1">
                    <DisqueSVG situation={d} placed={placed} size={150} />
                    <span className="text-xs font-semibold text-slate-400">
                        le disque
                    </span>
                </div>

                {/* Le modèle de la part — rotation non-prototypique */}
                <div className="flex flex-col items-center gap-1">
                    <svg
                        viewBox="0 0 200 200"
                        aria-label="Modèle : une part"
                        style={{
                            width: "150px",
                            height: "150px",
                            flexShrink: 0,
                        }}
                    >
                        <path
                            d={arc(
                                CENTER,
                                CENTER,
                                RADIUS,
                                d.ai * (360 / d.n),
                                (d.ai + 1) * (360 / d.n)
                            )}
                            fill={d.color}
                            opacity={0.9}
                            stroke="white"
                            strokeWidth="2"
                            transform={`rotate(${d.rot}, ${CENTER}, ${CENTER})`}
                        />
                    </svg>
                    <span
                        className="text-xs font-semibold"
                        style={{ color: d.color }}
                    >
                        une part
                    </span>
                </div>
            </div>

            {/* ── Phase active ── */}

            {isPredict && (
                <PhasePredict
                    consigne={
                        <>
                            Combien de{" "}
                            <em
                                className="not-italic font-extrabold"
                                style={{ color: d.color }}
                            >
                                parts
                            </em>{" "}
                            faut-il pour remplir le disque ?
                        </>
                    }
                    onPredict={handlePredict}
                    color={COLOR}
                />
            )}

            {isCount && (
                <DisquesPhaseCount
                    situation={d}
                    placed={placed}
                    feedback={feedback}
                    onContinue={handleCountContinue}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onValidate={handleValidateCount}
                />
            )}

            {!isPredict && !isCount && (
                <DisquesPhaseName
                    opts={nameOpts}
                    answer={FNAME[d.n]}
                    feedback={feedback}
                    onContinue={handleNameContinue}
                    onSelect={handleSelectName}
                />
            )}

            {/* ── Modale "disque déjà rempli" ── */}
            {showFullModal && (
                <FullModal
                    message="Le disque est déjà rempli ! Il n'est plus nécessaire d'ajouter."
                    color={COLOR}
                    onClose={() => setShowFullModal(false)}
                />
            )}
        </div>
    );
}

AtelierDisques.propTypes = {
    log: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired,
    onPrint: PropTypes.func.isRequired,
};
