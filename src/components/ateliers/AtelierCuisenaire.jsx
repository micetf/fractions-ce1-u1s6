/**
 * @file AtelierCuisenaire — atelier de fractions avec les réglettes Cuisenaire.
 *
 * @description
 * Activité en deux ou trois phases selon le type de situation :
 *
 * **Situations unitaires** (`nonUnit === false`) — 5 situations :
 * 1. **Phase `count`**   — L'élève empile des réglettes pour couvrir la référence.
 * 2. **Phase `name`**    — L'élève nomme la fraction représentée.
 *
 * **Situation non-unitaire** (`nonUnit === true`) — 1 situation (violette) :
 * 1. **Phase `explain`** — L'enseignant·e présente le raisonnement visuel.
 * 2. **Phase `name`**    — L'élève nomme la fraction composée.
 *
 * ────────────────────────────────────────────────────────────────
 * Particularité : indice à la demande
 * ────────────────────────────────────────────────────────────────
 * En phase `count`, un bouton "Besoin d'un indice ?" affiche le
 * texte `c.hint`. L'utilisation est journalisée (HINT_USED).
 *
 * ────────────────────────────────────────────────────────────────
 * Calcul du score maximal
 * ────────────────────────────────────────────────────────────────
 * Situations unitaires      : 2 points chacune (comptage + nommage)
 * Situation non-unitaire    : 1 point (nommage uniquement)
 * Total = CUI.length * 2 - 1 = 11 points
 *
 * @see useEventLog  Pour la structure du journal d'événements
 */

import { useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";

import { CUI, UNIT } from "../../data/cuisenaire.js";
import {
    okCountMsg,
    okNameMsg,
    errCountFew,
    errCountMany,
    errName1,
    errName2,
} from "../../utils/feedback.js";
import Btn from "../ui/Btn.jsx";
import Bubble from "../ui/Bubble.jsx";
import ProgDots from "../ui/ProgDots.jsx";
import CountBlocks from "../ui/CountBlocks.jsx";
import DoneScreen from "../ui/DoneScreen.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Couleur thématique de l'atelier Cuisenaire */
const COLOR = "#B45309";

/** Score maximal : 2pts × situations unitaires + 1pt × situation non-unitaire */
const MAX_SCORE = CUI.length * 2 - 1;

// ─── Sous-composant : réglette SVG ────────────────────────────────────────────

/**
 * Réglette Cuisenaire représentée par un rectangle coloré.
 *
 * @param {Object}      props
 * @param {number}      props.len   - Longueur en unités
 * @param {string}      props.bg    - Couleur de fond
 * @param {string}      props.bd    - Couleur de bordure
 * @param {string|null} props.label - Label affiché à gauche (null = pas de label)
 *
 * @returns {JSX.Element}
 */
function Rod({ len, bg, bd, label }) {
    return (
        <div className="flex items-center gap-2">
            {label !== null && (
                <span
                    className="text-xs font-bold text-slate-400 shrink-0"
                    style={{ width: "72px", textAlign: "right" }}
                >
                    {label}
                </span>
            )}
            <div
                className="rounded-lg flex items-center justify-center font-bold text-xs"
                style={{
                    width: `${len * UNIT}px`,
                    height: "36px",
                    background: bg,
                    border: `2px solid ${bd}`,
                    color: len === 1 ? "#9CA3AF" : "white",
                    boxShadow: "0 2px 6px rgba(0,0,0,.12)",
                    flexShrink: 0,
                }}
            >
                {len > 1 ? len : ""}
            </div>
        </div>
    );
}

Rod.propTypes = {
    len: PropTypes.number.isRequired,
    bg: PropTypes.string.isRequired,
    bd: PropTypes.string.isRequired,
    label: PropTypes.string,
};

Rod.defaultProps = { label: null };

// ─── Sous-composant : zone de visualisation ────────────────────────────────────

/**
 * Zone de visualisation des réglettes : référence + réglettes empilées.
 * Gère les deux modes : comptage normal et situation non-unitaire (violette).
 *
 * @param {Object}  props
 * @param {Object}  props.situation - Données de la situation
 * @param {number}  props.placed    - Réglettes posées (phase count)
 * @param {string}  props.phase     - Phase courante ('count'|'name'|'explain')
 *
 * @returns {JSX.Element}
 */
function RodVisualizer({ situation: c, placed, phase }) {
    const overflow = placed > c.n;
    const minWidth =
        Math.max(c.refLen, overflow ? placed * c.len : (c.n || 1) * c.len) *
            UNIT +
        80;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 overflow-x-auto shadow-sm">
            <div
                className="flex flex-col gap-3"
                style={{ minWidth: `${minWidth}px` }}
            >
                {/* Réglette de référence */}
                <Rod
                    len={c.refLen}
                    bg={c.refBg}
                    bd={c.refBd}
                    label="Le tout →"
                />
                <div style={{ borderTop: "1px dashed #E2E8F0" }} />

                {/* Phase normale : réglettes posées une à une */}
                {phase !== "explain" ? (
                    <div className="flex items-center gap-2">
                        <span
                            className="text-xs font-bold text-slate-400 shrink-0"
                            style={{ width: "72px", textAlign: "right" }}
                        >
                            Partie →
                        </span>
                        <div className="flex gap-0.5 items-center">
                            {Array.from({ length: Math.max(placed, 1) }).map(
                                (_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-md flex items-center justify-center text-xs font-bold transition-all"
                                        style={{
                                            width: `${c.len * UNIT}px`,
                                            height: "36px",
                                            background:
                                                i >= c.n ? "#EF4444" : c.bg,
                                            border: `2px solid ${i >= c.n ? "#B91C1C" : c.bd}`,
                                            color:
                                                c.len === 1
                                                    ? "#9CA3AF"
                                                    : "white",
                                            flexShrink: 0,
                                            opacity:
                                                placed === 0 && i === 0
                                                    ? 0.3
                                                    : 1,
                                            transform:
                                                i === placed - 1
                                                    ? "scale(1.05)"
                                                    : "scale(1)",
                                        }}
                                    >
                                        {c.len > 1 ? c.len : ""}
                                    </div>
                                )
                            )}
                            {overflow && (
                                <span className="text-xs font-bold text-red-500 ml-1">
                                    ⚠ déborde !
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Phase explain : réglette violette décomposée en 2 rouges */
                    <div className="flex flex-col gap-2">
                        <Rod len={4} bg={c.bg} bd={c.bd} label="Violette →" />
                        <div className="flex items-center gap-2">
                            <span
                                className="text-xs font-bold text-slate-400 shrink-0"
                                style={{ width: "72px", textAlign: "right" }}
                            >
                                = 2 rouges
                            </span>
                            <div className="flex gap-0.5">
                                <div
                                    className="rounded-md"
                                    style={{
                                        width: `${2 * UNIT}px`,
                                        height: "28px",
                                        background: "#EF4444",
                                        border: "2px solid #B91C1C",
                                    }}
                                />
                                <div
                                    className="rounded-md"
                                    style={{
                                        width: `${2 * UNIT}px`,
                                        height: "28px",
                                        background: "#EF4444",
                                        border: "2px solid #B91C1C",
                                    }}
                                />
                            </div>
                        </div>
                        <p
                            className="text-xs text-slate-400 font-semibold"
                            style={{ marginLeft: "80px" }}
                        >
                            Rouge = un cinquième de l'orange → Violette = ?
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

RodVisualizer.propTypes = {
    situation: PropTypes.shape({
        len: PropTypes.number.isRequired,
        bg: PropTypes.string.isRequired,
        bd: PropTypes.string.isRequired,
        refLen: PropTypes.number.isRequired,
        refBg: PropTypes.string.isRequired,
        refBd: PropTypes.string.isRequired,
        n: PropTypes.number,
    }).isRequired,
    placed: PropTypes.number.isRequired,
    phase: PropTypes.oneOf(["count", "name", "explain"]).isRequired,
};

// ─── Phase comptage ─────────────────────────────────────────────────────────────

/**
 * Interface de la phase de comptage pour l'atelier Cuisenaire.
 *
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation
 * @param {number}   props.placed     - Réglettes posées
 * @param {boolean}  props.hintShown  - Indice déjà affiché
 * @param {Object}   props.feedback   - { type, msg } ou null
 * @param {Function} props.onAdd      - Ajouter une réglette
 * @param {Function} props.onRemove   - Retirer une réglette
 * @param {Function} props.onHint     - Afficher l'indice
 * @param {Function} props.onValidate - Valider le comptage
 *
 * @returns {JSX.Element}
 */
function PhaseCount({
    situation: c,
    placed,
    hintShown,
    feedback,
    onAdd,
    onRemove,
    onHint,
    onValidate,
}) {
    const overflow = placed > c.n;
    const rodColor = overflow
        ? "#EF4444"
        : c.bg === "#F9FAFB"
          ? "#9CA3AF"
          : c.bg;

    return (
        <div className="flex flex-col gap-3">
            <div className="bg-slate-50 rounded-2xl p-2 text-center">
                <p className="text-sm font-bold text-slate-500 mb-1">
                    {placed} réglette{placed > 1 ? "s" : ""} posée
                    {placed > 1 ? "s" : ""}
                </p>
                <CountBlocks
                    placed={placed}
                    max={c.n + (overflow ? 1 : 0)}
                    color={rodColor}
                />
            </div>

            <div className="flex gap-3 justify-center">
                <button
                    onClick={onAdd}
                    disabled={placed >= c.n + 1}
                    aria-label="Ajouter une réglette"
                    className="btn-add flex-1 py-4 rounded-2xl text-2xl font-bold text-white
                     shadow-md disabled:opacity-40 touch-manipulation"
                    style={{ background: overflow ? "#9CA3AF" : COLOR }}
                >
                    ➕ Ajouter
                </button>
                <button
                    onClick={onRemove}
                    disabled={placed === 0}
                    aria-label="Retirer la dernière réglette"
                    className="btn-add py-4 px-5 rounded-2xl text-xl font-bold
                     bg-white border-2 border-slate-200 text-slate-600 disabled:opacity-30"
                >
                    ↩
                </button>
            </div>

            {!hintShown && (
                <button
                    onClick={onHint}
                    className="text-xs text-amber-700 underline text-center touch-manipulation py-1"
                >
                    Besoin d'un indice ?
                </button>
            )}
            {hintShown && <Bubble type="hint" msg={`💡 ${c.hint}`} />}
            {feedback && <Bubble type={feedback.type} msg={feedback.msg} />}

            <button
                onClick={onValidate}
                className="py-4 rounded-2xl text-lg font-bold text-white shadow-md
                   hover:brightness-110 active:scale-95 transition-all touch-manipulation"
                style={{ background: "#92400E" }}
            >
                ✓ La réglette {c.refName} est couverte !
            </button>
        </div>
    );
}

PhaseCount.propTypes = {
    situation: PropTypes.shape({
        bg: PropTypes.string.isRequired,
        refName: PropTypes.string.isRequired,
        n: PropTypes.number.isRequired,
        hint: PropTypes.string.isRequired,
    }).isRequired,
    placed: PropTypes.number.isRequired,
    hintShown: PropTypes.bool.isRequired,
    feedback: PropTypes.shape({
        type: PropTypes.string,
        msg: PropTypes.string,
    }),
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onHint: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
};

PhaseCount.defaultProps = { feedback: null };

// ─── Phase nommage ──────────────────────────────────────────────────────────────

/**
 * Interface de la phase de nommage / défi non-unitaire.
 *
 * @param {Object}   props
 * @param {Object}   props.situation - Données de la situation
 * @param {Object}   props.feedback  - { type, msg } ou null
 * @param {Function} props.onSelect  - Callback(option: string)
 *
 * @returns {JSX.Element}
 */
function PhaseName({ situation: c, feedback, onSelect }) {
    return (
        <div className="flex flex-col gap-3">
            {feedback && <Bubble type={feedback.type} msg={feedback.msg} />}
            <div className="flex flex-wrap gap-3 justify-center">
                {c.fOpts.map((opt) => {
                    let v = "idle";
                    if (feedback)
                        v =
                            opt === c.answer && feedback.type === "ok"
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
    situation: PropTypes.shape({
        fOpts: PropTypes.arrayOf(PropTypes.string).isRequired,
        answer: PropTypes.string.isRequired,
    }).isRequired,
    feedback: PropTypes.shape({
        type: PropTypes.string,
        msg: PropTypes.string,
    }),
    onSelect: PropTypes.func.isRequired,
};

PhaseName.defaultProps = { feedback: null };

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Atelier Cuisenaire — séquence de 6 situations de fractions des réglettes.
 *
 * @param {Object}   props
 * @param {Function} props.log - Émetteur d'événements pédagogiques
 *
 * @returns {JSX.Element}
 */
export default function AtelierCuisenaire({ log }) {
    const [idx, setIdx] = useState(0);
    const [placed, setPlaced] = useState(0);
    const [phase, setPhase] = useState("count");
    const [feedback, setFeedback] = useState(null);
    const [locked, setLocked] = useState(false);
    const [nameErr, setNameErr] = useState(0);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);
    const [hintShown, setHintShown] = useState(false);

    const sitStart = useRef(Date.now());
    const countErrCount = useRef(0);

    const c = CUI[idx];

    // ── Initialisation ─────────────────────────────────────────────────────────
    useEffect(() => {
        sitStart.current = Date.now();
        countErrCount.current = 0;
        setHintShown(false);
        setPlaced(0);
        setFeedback(null);
        setLocked(false);
        setNameErr(0);
        setPhase(c.nonUnit ? "explain" : "count");
        log("SIT_START", {
            idx,
            id: `cu${idx}`,
            label: `Réglette ${c.name} / ${c.refName}`,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

    // ── Reset ──────────────────────────────────────────────────────────────────
    const reset = useCallback(() => {
        setIdx(0);
        setScore(0);
        setDone(false);
    }, []);

    // ── Avancement ────────────────────────────────────────────────────────────
    const doAdvance = useCallback(
        (finalNameErr) => {
            const dur = Date.now() - sitStart.current;
            const fullScore =
                (c.nonUnit || countErrCount.current === 0) &&
                finalNameErr === 0;

            log("SIT_DONE", {
                idx,
                label: `${c.name} / ${c.refName}`,
                n: c.n,
                answer: c.answer,
                countErrors: c.nonUnit ? null : countErrCount.current,
                nameErrors: finalNameErr,
                durationMs: dur,
                hintUsed: hintShown,
                fullScore,
            });

            const next = idx + 1;
            if (next < CUI.length) setIdx(next);
            else {
                setDone(true);
                log("ATELIER_DONE", { maxScore: MAX_SCORE, durationMs: dur });
            }
        },
        [idx, c, hintShown, log]
    );

    // ── Handlers COUNT ─────────────────────────────────────────────────────────
    const handleAdd = useCallback(() => {
        if (placed <= c.n) setPlaced((p) => p + 1);
        setFeedback(null);
    }, [placed, c.n]);

    const handleRemove = useCallback(() => {
        setPlaced((p) => Math.max(p - 1, 0));
        setFeedback(null);
    }, []);

    const handleHint = useCallback(() => {
        setHintShown(true);
        log("HINT_USED", { idx });
    }, [idx, log]);

    const handleValidateCount = useCallback(() => {
        if (placed === c.n) {
            setScore((s) => s + 1);
            log("COUNT_OK", { idx, countErrors: countErrCount.current });
            setFeedback({
                type: "ok",
                msg: okCountMsg(
                    c.n,
                    `réglette ${c.name}`,
                    `réglette ${c.refName}`
                ),
            });
            setTimeout(() => {
                setPhase("name");
                setFeedback(null);
            }, 1800);
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
    }, [placed, c, idx, log]);

    // ── Handlers NAME ──────────────────────────────────────────────────────────
    const handleSelectName = useCallback(
        (opt) => {
            if (locked) return;
            setLocked(true);

            if (opt === c.answer) {
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
                setTimeout(() => doAdvance(nameErr), 2200);
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
                setTimeout(() => {
                    setFeedback(null);
                    setLocked(false);
                }, 2400);
            }
        },
        [locked, c, nameErr, idx, doAdvance, log]
    );

    // ── Rendu ──────────────────────────────────────────────────────────────────
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

    const isCount = phase === "count";
    const isNaming = phase === "name" || phase === "explain";

    return (
        <div className="flex flex-col gap-4">
            {/* Progression */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {idx + 1}/{CUI.length}
                </span>
                <ProgDots done={score} total={MAX_SCORE} color={COLOR} />
            </div>

            {/* Consigne */}
            <div
                className="bg-amber-50 border border-amber-100 rounded-2xl p-3
                      text-center text-lg font-bold text-amber-900 leading-snug"
            >
                {isCount && (
                    <>
                        Combien de réglettes{" "}
                        <em
                            className="not-italic font-extrabold"
                            style={{
                                color: c.bg === "#F9FAFB" ? "#6B7280" : c.bg,
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
                )}
                {phase === "name" && (
                    <>
                        La réglette {c.name} représente _____ de la réglette{" "}
                        {c.refName}.
                    </>
                )}
                {phase === "explain" && (
                    <>
                        ★ Défi — La réglette violette représente _____ de la
                        réglette orange.
                    </>
                )}
            </div>

            {/* Visualisation réglettes */}
            <RodVisualizer situation={c} placed={placed} phase={phase} />

            {/* Phase active */}
            {isCount && (
                <PhaseCount
                    situation={c}
                    placed={placed}
                    hintShown={hintShown}
                    feedback={feedback}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onHint={handleHint}
                    onValidate={handleValidateCount}
                />
            )}
            {isNaming && (
                <PhaseName
                    situation={c}
                    feedback={feedback}
                    onSelect={handleSelectName}
                />
            )}
        </div>
    );
}

AtelierCuisenaire.propTypes = {
    /**
     * Émetteur d'événements vers le journal pédagogique.
     * Signature : log(type: string, data: Object) => void
     */
    log: PropTypes.func.isRequired,
};
