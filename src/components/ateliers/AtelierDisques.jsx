/**
 * @file AtelierDisques — atelier de fractions avec les parts du disque.
 *
 * @description
 * Activité en deux phases enchaînées pour chaque situation :
 *
 * 1. **Phase `count`** — Le disque commence vide. L'élève ajoute des parts
 *    un à un jusqu'à le remplir entièrement, puis valide. Une part de
 *    référence (toujours visible) rappelle la part à compter.
 *
 * 2. **Phase `name`**  — L'élève choisit parmi 4 options le nom de la fraction.
 *
 * ────────────────────────────────────────────────────────────────
 * Modèle de remplissage
 * ────────────────────────────────────────────────────────────────
 * `placed` va de 0 (disque vide) à d.n (disque plein).
 * Ordre de remplissage : part `ai` en premier (= part de référence),
 * puis les autres dans l'ordre des index SVG.
 * Tenter d'ajouter quand placed === d.n → FullModal.
 *
 * ────────────────────────────────────────────────────────────────
 * Options de nommage
 * ────────────────────────────────────────────────────────────────
 * Générées aléatoirement à chaque situation via `useMemo`.
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
import Btn from "../ui/Btn.jsx";
import Bubble from "../ui/Bubble.jsx";
import ProgDots from "../ui/ProgDots.jsx";
import DoneScreen from "../ui/DoneScreen.jsx";
import FullModal from "../ui/FullModal.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

const COLOR = "#7C3AED";
const MAX_SCORE = DQ.length * 2;
const RADIUS = 85;
const CENTER = 100;

// ─── DisqueSVG ─────────────────────────────────────────────────────────────────

/**
 * Disque progressivement rempli part par part.
 *
 * placed=0 → disque vide. placed=d.n → disque plein.
 * Ordre de remplissage : part ai en premier, puis les autres.
 *
 * @param {{ situation: Object, placed: number }} props
 */
function DisqueSVG({ situation: d, placed, size = 200 }) {
    const step = 360 / d.n;

    // Ordre de remplissage : ai en tête (correspond à la part de référence)
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
            aria-label={`Disque divisé en ${d.n} parts, ${placed} colorée${placed > 1 ? "s" : ""}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                filter: "drop-shadow(0 4px 14px rgba(0,0,0,.12))",
            }}
        >
            <circle cx={CENTER} cy={CENTER} r={88} fill="white" />

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

            <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.5"
            />
            <circle cx={CENTER} cy={CENTER} r={4} fill="white" />
        </svg>
    );
}

DisqueSVG.propTypes = {
    situation: PropTypes.shape({
        n: PropTypes.number.isRequired,
        ai: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired,
    }).isRequired,
    placed: PropTypes.number.isRequired,
    size: PropTypes.number,
};

// ─── PhaseCount ────────────────────────────────────────────────────────────────

/**
 * Interface de la phase de comptage pour l'atelier Disques.
 *
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation
 * @param {number}   props.placed     - parts placés (0..d.n)
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Transition vers la phase name
 * @param {Function} props.onAdd      - Ajouter une part
 * @param {Function} props.onRemove   - Retirer une part
 * @param {Function} props.onValidate - Valider le comptage
 */
function PhaseCount({
    situation: d,
    placed,
    feedback,
    onContinue,
    onAdd,
    onRemove,
    onValidate,
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onAdd}
                    aria-label="Ajouter une part"
                    className="btn-add flex-1 py-4 rounded-2xl text-2xl font-bold text-white
                     shadow-md touch-manipulation"
                    style={{ background: d.color }}
                >
                    ➕ Ajouter
                </button>
                <button
                    onClick={onRemove}
                    disabled={placed === 0}
                    aria-label="Retirer la dernière part"
                    className="btn-add py-4 px-5 rounded-2xl text-xl font-bold
                     bg-white border-2 border-slate-200 text-slate-600 disabled:opacity-30"
                >
                    ↩
                </button>
            </div>

            {feedback && (
                <Bubble
                    type={feedback.type}
                    msg={feedback.msg}
                    onContinue={feedback.type === "ok" ? onContinue : null}
                />
            )}

            {feedback?.type !== "ok" && (
                <button
                    onClick={onValidate}
                    className="py-4 rounded-2xl text-lg font-bold text-white shadow-md
                     hover:brightness-110 active:scale-95 transition-all touch-manipulation"
                    style={{ background: "#4C1D95" }}
                >
                    ✓ Le disque est rempli !
                </button>
            )}
        </div>
    );
}

PhaseCount.propTypes = {
    situation: PropTypes.shape({
        n: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired,
    }).isRequired,
    placed: PropTypes.number.isRequired,
    feedback: PropTypes.shape({
        type: PropTypes.string,
        msg: PropTypes.string,
    }),
    onContinue: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
};

PhaseCount.defaultProps = { feedback: null };

// ─── PhaseName ─────────────────────────────────────────────────────────────────

/**
 * Interface de la phase de nommage pour l'atelier Disques.
 *
 * @param {Object}   props
 * @param {string[]} props.opts       - Quatre options proposées
 * @param {string}   props.answer     - Fraction attendue
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Avancement à la situation suivante
 * @param {Function} props.onSelect   - Callback(option: string)
 */
function PhaseName({ opts, answer, feedback, onContinue, onSelect }) {
    return (
        <div className="flex flex-col gap-3">
            {feedback && (
                <Bubble
                    type={feedback.type}
                    msg={feedback.msg}
                    onContinue={feedback.type === "ok" ? onContinue : null}
                />
            )}
            <div className="flex flex-wrap gap-3 justify-center">
                {opts.map((opt) => {
                    let v = "idle";
                    if (feedback && feedback.type === "ok") {
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

PhaseName.propTypes = {
    opts: PropTypes.arrayOf(PropTypes.string).isRequired,
    answer: PropTypes.string.isRequired,
    feedback: PropTypes.shape({
        type: PropTypes.string,
        msg: PropTypes.string,
    }),
    onContinue: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
};

PhaseName.defaultProps = { feedback: null };

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Atelier Disques — séquence de 7 situations de fractions du disque.
 *
 * @param {Object}   props
 * @param {Function} props.log - Émetteur d'événements pédagogiques
 */
export default function AtelierDisques({ log }) {
    const [idx, setIdx] = useState(0);
    const [placed, setPlaced] = useState(0);
    const [phase, setPhase] = useState("count");
    const [feedback, setFeedback] = useState(null);
    const [locked, setLocked] = useState(false);
    const [showFullModal, setShowFullModal] = useState(false);
    const [nameErr, setNameErr] = useState(0);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const sitStart = useRef(Date.now());
    const countErrCount = useRef(0);

    const d = DQ[idx];

    useEffect(() => {
        sitStart.current = Date.now();
        countErrCount.current = 0;
        log("SIT_START", { idx, id: `dq${idx}`, label: `Disque ÷${d.n}` });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

    const nameOpts = useMemo(() => {
        const correct = FNAME[d.n];
        const others = [2, 3, 4, 5, 6, 8, 10]
            .filter((k) => k !== d.n)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((k) => FNAME[k]);
        return [correct, ...others].sort(() => Math.random() - 0.5);
    }, [d.n]);

    const reset = useCallback(() => {
        setIdx(0);
        setPlaced(0);
        setPhase("count");
        setFeedback(null);
        setLocked(false);
        setShowFullModal(false);
        setNameErr(0);
        setScore(0);
        setDone(false);
    }, []);

    const doAdvance = useCallback(
        (finalNameErr) => {
            const dur = Date.now() - sitStart.current;
            const fullScore = countErrCount.current === 0 && finalNameErr === 0;

            log("SIT_DONE", {
                idx,
                label: `Disque ÷${d.n}`,
                n: d.n,
                answer: FNAME[d.n],
                countErrors: countErrCount.current,
                nameErrors: finalNameErr,
                durationMs: dur,
                fullScore,
            });

            const next = idx + 1;
            if (next < DQ.length) {
                setIdx(next);
                setPlaced(0);
                setPhase("count");
                setFeedback(null);
                setLocked(false);
                setNameErr(0);
            } else {
                setDone(true);
                log("ATELIER_DONE", { maxScore: MAX_SCORE, durationMs: dur });
            }
        },
        [idx, d, log]
    );

    // ── Handlers COUNT ──────────────────────────────────────────────────────────

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

    const handleValidateCount = useCallback(() => {
        if (placed === d.n) {
            setScore((s) => s + 1);
            log("COUNT_OK", { idx, countErrors: countErrCount.current });
            setFeedback({
                type: "ok",
                msg: okCountMsg(d.n, "part", "disque"),
            });
        } else if (placed < d.n) {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed, expected: d.n });
            setFeedback({ type: "err", msg: errCountFew(placed, d.n) });
        } else {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed, expected: d.n });
            setFeedback({ type: "err", msg: errCountMany(placed, d.n) });
        }
    }, [placed, d, idx, log]);

    // ── Handlers NAME ────────────────────────────────────────────────────────────

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

    // ── Callbacks de continuation ────────────────────────────────────────────────

    const handleCountContinue = useCallback(() => {
        setPhase("name");
        setFeedback(null);
    }, []);

    const handleNameContinue = useCallback(() => {
        doAdvance(nameErr);
    }, [doAdvance, nameErr]);

    // ── Rendu ────────────────────────────────────────────────────────────────────

    if (done) {
        return (
            <DoneScreen
                score={score}
                max={MAX_SCORE}
                label="Disques"
                onReset={reset}
                color={COLOR}
            />
        );
    }

    const isCount = phase === "count";

    return (
        <div className="flex flex-col gap-4">
            {/* Progression */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {idx + 1}/{DQ.length}
                </span>
                <ProgDots done={score} total={MAX_SCORE} color={COLOR} />
            </div>

            {/* Consigne */}
            <div
                className="bg-purple-50 border border-purple-100 rounded-2xl p-3
                      text-center text-lg font-bold text-purple-900 leading-snug"
            >
                {isCount
                    ? "Combien de parts faut-il pour remplir le disque entier ?"
                    : "Cette part représente _____ du disque."}
            </div>

            {/* ── Visualisation : disque à remplir + modèle de la part, même échelle ── */}
            {/*
        Les deux SVGs : size=150px CSS, viewBox="0 0 200 200".
        150 + 150 + gap ≈ 316px → tient sur un écran 375px.
        La part modèle est tourné de d.rot° autour du centre pour éviter
        toute orientation prototypique (corde verticale, pointe cardinale…).
      */}
            <div className="flex items-end justify-center gap-4">
                {/* Le disque à remplir progressivement */}
                <div className="flex flex-col items-center gap-1">
                    <DisqueSVG situation={d} placed={placed} size={150} />
                    <span className="text-xs font-semibold text-slate-400">
                        le disque
                    </span>
                </div>

                {/* Le modèle de la part : même taille CSS, rotation non-prototypique */}
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

            {/* Phase active */}
            {isCount ? (
                <PhaseCount
                    situation={d}
                    placed={placed}
                    feedback={feedback}
                    onContinue={handleCountContinue}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onValidate={handleValidateCount}
                />
            ) : (
                <PhaseName
                    opts={nameOpts}
                    answer={FNAME[d.n]}
                    feedback={feedback}
                    onContinue={handleNameContinue}
                    onSelect={handleSelectName}
                />
            )}

            {/* Modale "disque déjà rempli" */}
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
};
