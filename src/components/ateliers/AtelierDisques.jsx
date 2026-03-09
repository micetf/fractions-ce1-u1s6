/**
 * @file AtelierDisques — atelier de fractions avec les secteurs du disque.
 *
 * @description
 * Activité en deux phases enchaînées pour chaque situation :
 *
 * 1. **Phase `count`** — L'élève ajoute des secteurs jusqu'à compléter le disque.
 * 2. **Phase `name`**  — L'élève choisit parmi 4 options le nom de la fraction.
 *
 * ────────────────────────────────────────────────────────────────
 * Particularités visuelles
 * ────────────────────────────────────────────────────────────────
 * - Un secteur actif (index `d.ai`) est toujours visible et coloré.
 * - Les autres secteurs s'ajoutent un à un en cliquant "Ajouter".
 * - La validation n'est possible que quand le disque est entier
 *   (placed + 1 === d.n).
 *
 * ────────────────────────────────────────────────────────────────
 * Options de nommage
 * ────────────────────────────────────────────────────────────────
 * Générées aléatoirement à chaque situation via `useMemo` :
 * la réponse correcte + 3 distracteurs tirés de FNAME.
 *
 * @see useEventLog  Pour la structure du journal d'événements
 * @see FNAME        Pour la table des noms de fractions
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
import CountBlocks from "../ui/CountBlocks.jsx";
import DoneScreen from "../ui/DoneScreen.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Couleur thématique de l'atelier Disques */
const COLOR = "#7C3AED";
/** Score maximal (2 points × nombre de situations) */
const MAX_SCORE = DQ.length * 2;
/** Rayon du disque SVG */
const RADIUS = 85;
/** Centre du disque SVG */
const CENTER = 100;

// ─── Sous-composant SVG ────────────────────────────────────────────────────────

/**
 * Représentation SVG du disque avec le secteur actif et les secteurs ajoutés.
 *
 * @param {Object} props
 * @param {Object} props.situation - Données de la situation (n, ai, color)
 * @param {number} props.placed    - Nombre de secteurs ajoutés (hors secteur actif)
 *
 * @returns {JSX.Element}
 */
function DisqueSVG({ situation: d, placed }) {
    const step = 360 / d.n;

    // Ordre de remplissage : tous les index sauf le secteur actif
    const fillOrder = useMemo(
        () =>
            Array.from({ length: d.n }, (_, k) => k).filter((k) => k !== d.ai),
        [d.n, d.ai]
    );

    return (
        <svg
            viewBox="0 0 200 200"
            aria-label={`Disque divisé en ${d.n} parts, ${placed + 1} colorée${placed > 0 ? "s" : ""}`}
            style={{
                width: "200px",
                height: "200px",
                filter: "drop-shadow(0 4px 14px rgba(0,0,0,.12))",
            }}
        >
            <circle cx={CENTER} cy={CENTER} r={88} fill="white" />

            {Array.from({ length: d.n }).map((_, i) => {
                const a1 = i * step;
                const a2 = a1 + step;
                const isActive = i === d.ai;
                const isPlaced = !isActive && fillOrder.indexOf(i) < placed;

                return (
                    <path
                        key={i}
                        d={arc(CENTER, CENTER, RADIUS, a1, a2)}
                        fill={isActive || isPlaced ? d.color : "#E2E8F0"}
                        opacity={isActive ? 0.9 : isPlaced ? 0.65 : 0.5}
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
};

// ─── Phase comptage ─────────────────────────────────────────────────────────────

/**
 * Interface de la phase de comptage pour l'atelier Disques.
 *
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation
 * @param {number}   props.placed     - Secteurs ajoutés (hors secteur actif)
 * @param {Object}   props.feedback   - { type, msg } ou null
 * @param {Function} props.onAdd      - Ajouter un secteur
 * @param {Function} props.onRemove   - Retirer un secteur
 * @param {Function} props.onValidate - Valider le comptage
 *
 * @returns {JSX.Element}
 */
function PhaseCount({
    situation: d,
    placed,
    feedback,
    onAdd,
    onRemove,
    onValidate,
}) {
    const full = placed + 1 >= d.n;

    return (
        <div className="flex flex-col gap-3">
            <div className="bg-slate-50 rounded-2xl p-2 text-center">
                <p className="text-sm font-bold text-slate-500 mb-1">
                    {placed + 1} secteur{placed > 0 ? "s" : ""} coloré
                    {placed > 0 ? "s" : ""}
                </p>
                <CountBlocks placed={placed + 1} max={d.n} color={d.color} />
            </div>

            <div className="flex gap-3 justify-center">
                <button
                    onClick={onAdd}
                    disabled={full}
                    aria-label="Ajouter un secteur"
                    className="btn-add flex-1 py-4 rounded-2xl text-2xl font-bold text-white
                     shadow-md disabled:opacity-40 touch-manipulation"
                    style={{ background: full ? "#9CA3AF" : d.color }}
                >
                    ➕ Ajouter
                </button>
                <button
                    onClick={onRemove}
                    disabled={placed === 0}
                    aria-label="Retirer le dernier secteur"
                    className="btn-add py-4 px-5 rounded-2xl text-xl font-bold
                     bg-white border-2 border-slate-200 text-slate-600 disabled:opacity-30"
                >
                    ↩
                </button>
            </div>

            {feedback && <Bubble type={feedback.type} msg={feedback.msg} />}

            <button
                onClick={onValidate}
                className="py-4 rounded-2xl text-lg font-bold text-white shadow-md
                   hover:brightness-110 active:scale-95 transition-all touch-manipulation"
                style={{ background: "#4C1D95" }}
            >
                ✓ Le disque est rempli !
            </button>
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
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
};

PhaseCount.defaultProps = { feedback: null };

// ─── Phase nommage ──────────────────────────────────────────────────────────────

/**
 * Interface de la phase de nommage pour l'atelier Disques.
 *
 * @param {Object}   props
 * @param {string[]} props.opts     - Quatre options proposées (mélangées)
 * @param {string}   props.answer   - Fraction attendue
 * @param {Object}   props.feedback - { type, msg } ou null
 * @param {Function} props.onSelect - Callback(option: string)
 *
 * @returns {JSX.Element}
 */
function PhaseName({ opts, answer, feedback, onSelect }) {
    return (
        <div className="flex flex-col gap-3">
            {feedback && <Bubble type={feedback.type} msg={feedback.msg} />}
            <div className="flex flex-wrap gap-3 justify-center">
                {opts.map((opt) => {
                    let v = "idle";
                    if (feedback)
                        v =
                            opt === answer && feedback.type === "ok"
                                ? "ok"
                                : "off";
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
    onSelect: PropTypes.func.isRequired,
};

PhaseName.defaultProps = { feedback: null };

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Atelier Disques — séquence de 7 situations de fractions du disque.
 *
 * @param {Object}   props
 * @param {Function} props.log - Émetteur d'événements pédagogiques
 *
 * @returns {JSX.Element}
 */
export default function AtelierDisques({ log }) {
    const [idx, setIdx] = useState(0);
    const [placed, setPlaced] = useState(0);
    const [phase, setPhase] = useState("count");
    const [feedback, setFeedback] = useState(null);
    const [locked, setLocked] = useState(false);
    const [nameErr, setNameErr] = useState(0);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const sitStart = useRef(Date.now());
    const countErrCount = useRef(0);

    const d = DQ[idx];

    // ── Initialisation ─────────────────────────────────────────────────────────
    useEffect(() => {
        sitStart.current = Date.now();
        countErrCount.current = 0;
        log("SIT_START", { idx, id: `dq${idx}`, label: `Disque ÷${d.n}` });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

    // ── Options de nommage (stable par situation) ──────────────────────────────
    const nameOpts = useMemo(() => {
        const correct = FNAME[d.n];
        const others = [2, 3, 4, 5, 6, 8, 10]
            .filter((k) => k !== d.n)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((k) => FNAME[k]);
        return [correct, ...others].sort(() => Math.random() - 0.5);
    }, [d.n]);

    // ── Reset complet ──────────────────────────────────────────────────────────
    const reset = useCallback(() => {
        setIdx(0);
        setPlaced(0);
        setPhase("count");
        setFeedback(null);
        setLocked(false);
        setNameErr(0);
        setScore(0);
        setDone(false);
    }, []);

    // ── Avancement vers la situation suivante ──────────────────────────────────
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

    // ── Handlers COUNT ─────────────────────────────────────────────────────────
    const handleAdd = useCallback(() => {
        if (placed + 1 < d.n) setPlaced((p) => p + 1);
        setFeedback(null);
    }, [placed, d.n]);

    const handleRemove = useCallback(() => {
        setPlaced((p) => Math.max(p - 1, 0));
        setFeedback(null);
    }, []);

    const handleValidateCount = useCallback(() => {
        const total = placed + 1;

        if (total === d.n) {
            setScore((s) => s + 1);
            log("COUNT_OK", { idx, countErrors: countErrCount.current });
            setFeedback({
                type: "ok",
                msg: okCountMsg(d.n, "secteur", "disque"),
            });
            setTimeout(() => {
                setPhase("name");
                setFeedback(null);
            }, 1800);
        } else if (total < d.n) {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed: total, expected: d.n });
            setFeedback({ type: "err", msg: errCountFew(total, d.n) });
        } else {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed: total, expected: d.n });
            setFeedback({ type: "err", msg: errCountMany(total, d.n) });
        }
    }, [placed, d, idx, log]);

    // ── Handlers NAME ──────────────────────────────────────────────────────────
    const handleSelectName = useCallback(
        (opt) => {
            if (locked) return;
            setLocked(true);

            const ans = FNAME[d.n];

            if (opt === ans) {
                setScore((s) => s + 1);
                log("NAME_OK", { idx, nameErrors: nameErr });
                setFeedback({
                    type: "ok",
                    msg: okNameMsg(d.n, "secteur", "disque", ans),
                });
                setTimeout(() => doAdvance(nameErr), 2000);
            } else {
                const ne = nameErr + 1;
                setNameErr(ne);
                log("NAME_ERR", { idx, chosen: opt, answer: ans, errN: ne });
                setFeedback({
                    type: "err",
                    msg: ne === 1 ? errName1(d.n, "secteurs") : errName2(d.n),
                });
                setTimeout(() => {
                    setFeedback(null);
                    setLocked(false);
                }, 2200);
            }
        },
        [locked, d, nameErr, idx, doAdvance, log]
    );

    // ── Rendu ──────────────────────────────────────────────────────────────────
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
                    ? "Combien de secteurs faut-il pour remplir le disque entier ?"
                    : "Ce secteur représente _____ du disque."}
            </div>

            {/* Rappel du découpage */}
            <div className="bg-slate-50 rounded-2xl p-2 text-center text-sm font-semibold text-purple-700">
                Le disque est partagé en {d.n} parts égales.
            </div>

            {/* SVG */}
            <div className="flex justify-center">
                <DisqueSVG situation={d} placed={placed} />
            </div>

            {/* Phase active */}
            {isCount ? (
                <PhaseCount
                    situation={d}
                    placed={placed}
                    feedback={feedback}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onValidate={handleValidateCount}
                />
            ) : (
                <PhaseName
                    opts={nameOpts}
                    answer={FNAME[d.n]}
                    feedback={feedback}
                    onSelect={handleSelectName}
                />
            )}
        </div>
    );
}

AtelierDisques.propTypes = {
    /**
     * Émetteur d'événements vers le journal pédagogique.
     * Signature : log(type: string, data: Object) => void
     */
    log: PropTypes.func.isRequired,
};
