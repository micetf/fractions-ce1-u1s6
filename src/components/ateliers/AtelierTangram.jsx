/**
 * @file AtelierTangram — atelier de fractions avec les pièces du Tangram.
 *
 * @description
 * Activité en deux phases enchaînées pour chaque situation :
 *
 * 1. **Phase `count`** — L'élève ajoute des pièces fantômes dans le carré
 *    jusqu'à ce qu'il soit entièrement rempli, puis valide.
 *
 * 2. **Phase `name`**  — L'élève choisit parmi 4 options le nom de la
 *    fraction que représente la pièce active.
 *
 * ────────────────────────────────────────────────────────────────
 * Machine d'état interne
 * ────────────────────────────────────────────────────────────────
 *
 *   INIT ──► count ──[validateCount OK]──► name ──[validateName OK]──► NEXT_SIT
 *              │                                         │
 *              └──[validateCount ERR]──► (retry)         └──[validateName ERR]──► (retry)
 *
 * ────────────────────────────────────────────────────────────────
 * Scoring
 * ────────────────────────────────────────────────────────────────
 * +1 point par phase réussie (max 2 points/situation = 10 points/atelier).
 * Le score est incrémenté dès la réussite, pas à la fin.
 *
 * ────────────────────────────────────────────────────────────────
 * Journalisation
 * ────────────────────────────────────────────────────────────────
 * Tous les événements sont émis via `props.log` pour le Dashboard.
 * @see useEventLog
 */

import { useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";

import { TG } from "../../data/tangram.js";
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

/** Couleur thématique de l'atelier Tangram */
const COLOR = "#2563EB";

/** Score maximal possible (2 points × nombre de situations) */
const MAX_SCORE = TG.length * 2;

// ─── Composant SVG interne ─────────────────────────────────────────────────────

/**
 * Représentation SVG du carré Tangram avec pièce active et fantômes.
 *
 * @param {Object}  props
 * @param {Object}  props.situation  - Données de la situation en cours
 * @param {number}  props.placed     - Nombre de pièces fantômes placées
 * @param {boolean} props.overflow   - Vrai si placed > ghosts.length
 *
 * @returns {JSX.Element}
 */
function TangramSVG({ situation: s, placed, overflow }) {
    return (
        <svg
            viewBox="0 0 200 200"
            aria-label={`Carré Tangram avec ${placed + 1} pièce${placed > 0 ? "s" : ""}`}
            style={{
                width: "200px",
                height: "200px",
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

            {/* Pièces fantômes (emplacements à remplir) */}
            {s.ghosts.map((pts, i) => (
                <polygon
                    key={i}
                    points={pts}
                    fill={
                        overflow && i === s.ghosts.length - 1
                            ? "#FCA5A5"
                            : s.ghostC
                    }
                    opacity={
                        i < placed
                            ? overflow && i >= s.ghosts.length - 1
                                ? 0.55
                                : 0.85
                            : 0.1
                    }
                    stroke="white"
                    strokeWidth="1.5"
                />
            ))}

            {/* Surimpression rouge si débordement */}
            {overflow && (
                <polygon
                    points={s.ghosts[0]}
                    fill="#EF4444"
                    opacity={0.4}
                    stroke="#FCA5A5"
                    strokeWidth="2"
                />
            )}

            {/* Pièce active (toujours visible, colorée) */}
            <polygon
                points={s.active}
                fill={s.color}
                stroke="white"
                strokeWidth="2"
            />

            {/* Bordure du carré */}
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
    situation: PropTypes.shape({
        color: PropTypes.string.isRequired,
        ghostC: PropTypes.string.isRequired,
        active: PropTypes.string.isRequired,
        ghosts: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    placed: PropTypes.number.isRequired,
    overflow: PropTypes.bool.isRequired,
};

// ─── Phase comptage ─────────────────────────────────────────────────────────────

/**
 * Interface de la phase de comptage : ajout/retrait de pièces + validation.
 *
 * @param {Object}   props
 * @param {Object}   props.situation    - Données de la situation
 * @param {number}   props.placed       - Pièces actuellement placées
 * @param {boolean}  props.overflow     - Débordement détecté
 * @param {Object}   props.feedback     - Objet { type, msg } ou null
 * @param {Function} props.onAdd        - Ajouter une pièce
 * @param {Function} props.onRemove     - Retirer une pièce
 * @param {Function} props.onValidate   - Valider le comptage
 *
 * @returns {JSX.Element}
 */
function PhaseCount({
    situation: s,
    placed,
    overflow,
    feedback,
    onAdd,
    onRemove,
    onValidate,
}) {
    const blockColor = overflow ? "#EF4444" : s.color;

    return (
        <div className="flex flex-col gap-3">
            {/* Compteur visuel */}
            <div className="bg-slate-50 rounded-2xl p-3 text-center">
                <p className="text-sm font-bold text-slate-500 mb-1">
                    {placed + 1} {s.pieceLabel}
                    {placed > 0 ? "s" : ""}
                    {overflow ? " ⚠ ça déborde !" : ""}
                </p>
                <CountBlocks
                    placed={placed + 1}
                    max={s.n + (overflow ? 1 : 0)}
                    color={blockColor}
                />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onAdd}
                    disabled={overflow}
                    aria-label="Ajouter une pièce"
                    className="btn-add flex-1 py-4 rounded-2xl text-2xl font-bold text-white
                     shadow-md disabled:opacity-40 touch-manipulation"
                    style={{ background: overflow ? "#9CA3AF" : s.color }}
                >
                    ➕ Ajouter
                </button>
                <button
                    onClick={onRemove}
                    disabled={placed === 0}
                    aria-label="Retirer la dernière pièce"
                    className="btn-add py-4 px-5 rounded-2xl text-xl font-bold
                     bg-white border-2 border-slate-200 text-slate-600 disabled:opacity-30"
                >
                    ↩
                </button>
            </div>

            {/* Feedback conditionnel */}
            {feedback && <Bubble type={feedback.type} msg={feedback.msg} />}

            {/* Bouton de validation (masqué en cas de débordement) */}
            {!overflow && (
                <button
                    onClick={onValidate}
                    className="py-4 rounded-2xl text-lg font-bold text-white shadow-md
                     hover:brightness-110 active:scale-95 transition-all touch-manipulation"
                    style={{ background: "#1E40AF" }}
                >
                    ✓ Le {s.tout} est rempli !
                </button>
            )}
        </div>
    );
}

PhaseCount.propTypes = {
    situation: PropTypes.shape({
        pieceLabel: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        tout: PropTypes.string.isRequired,
        n: PropTypes.number.isRequired,
    }).isRequired,
    placed: PropTypes.number.isRequired,
    overflow: PropTypes.bool.isRequired,
    feedback: PropTypes.shape({
        type: PropTypes.oneOf(["ok", "err", "hint"]).isRequired,
        msg: PropTypes.string.isRequired,
    }),
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
};

PhaseCount.defaultProps = {
    feedback: null,
};

// ─── Phase nommage ──────────────────────────────────────────────────────────────

/**
 * Interface de la phase de nommage : sélection parmi 4 options de fraction.
 *
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation
 * @param {Object}   props.feedback   - Objet { type, msg } ou null
 * @param {Function} props.onSelect   - Callback(option: string)
 *
 * @returns {JSX.Element}
 */
function PhaseName({ situation: s, feedback, onSelect }) {
    return (
        <div className="flex flex-col gap-3">
            {feedback && <Bubble type={feedback.type} msg={feedback.msg} />}

            <div className="flex flex-wrap gap-3 justify-center">
                {s.fOpts.map((opt) => {
                    let v = "idle";
                    if (feedback) {
                        v =
                            opt === s.answer && feedback.type === "ok"
                                ? "ok"
                                : "off";
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
    situation: PropTypes.shape({
        fOpts: PropTypes.arrayOf(PropTypes.string).isRequired,
        answer: PropTypes.string.isRequired,
    }).isRequired,
    feedback: PropTypes.shape({
        type: PropTypes.oneOf(["ok", "err", "hint"]).isRequired,
        msg: PropTypes.string.isRequired,
    }),
    onSelect: PropTypes.func.isRequired,
};

PhaseName.defaultProps = {
    feedback: null,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Atelier Tangram — séquence de 5 situations de fractions du carré.
 *
 * @param {Object}   props
 * @param {Function} props.log - Émetteur d'événements pédagogiques (useEventLog)
 *
 * @returns {JSX.Element}
 */
export default function AtelierTangram({ log }) {
    // ── État de la situation ──────────────────────────────────────────────────
    const [idx, setIdx] = useState(0);
    const [placed, setPlaced] = useState(0);
    const [phase, setPhase] = useState("count"); // 'count' | 'name'
    const [feedback, setFeedback] = useState(null); // { type, msg } | null
    const [locked, setLocked] = useState(false); // verrou anti-double-clic

    // ── Métriques de la situation ─────────────────────────────────────────────
    const [nameErr, setNameErr] = useState(0);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    // ── Refs (pas de re-render nécessaire) ───────────────────────────────────
    const sitStart = useRef(Date.now());
    const countErrCount = useRef(0);

    const s = TG[idx];
    const overflow = placed > s.ghosts.length;

    // ── Initialisation à chaque nouvelle situation ────────────────────────────
    useEffect(() => {
        sitStart.current = Date.now();
        countErrCount.current = 0;
        log("SIT_START", { idx, id: s.id, label: s.label });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

    // ── Réinitialisation complète de l'atelier ────────────────────────────────
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

    // ── Passage à la situation suivante (ou fin d'atelier) ────────────────────
    const doAdvance = useCallback(
        (finalNameErr) => {
            const dur = Date.now() - sitStart.current;
            const isFullScore =
                countErrCount.current === 0 && finalNameErr === 0;

            log("SIT_DONE", {
                idx,
                label: s.label,
                n: s.n,
                answer: s.answer,
                countErrors: countErrCount.current,
                nameErrors: finalNameErr,
                durationMs: dur,
                fullScore: isFullScore,
            });

            const next = idx + 1;

            if (next < TG.length) {
                setIdx(next);
                setPlaced(0);
                setPhase("count");
                setFeedback(null);
                setLocked(false);
                setNameErr(0);
            } else {
                setDone(true);
                log("ATELIER_DONE", {
                    totalScore: score + (isFullScore ? 0 : 0), // déjà incrémenté
                    maxScore: MAX_SCORE,
                    durationMs: dur,
                });
            }
        },
        [idx, s, score, log]
    );

    // ── Handlers phase COUNT ──────────────────────────────────────────────────

    const handleAdd = useCallback(() => {
        if (!overflow) setPlaced((p) => p + 1);
        setFeedback(null);
    }, [overflow]);

    const handleRemove = useCallback(() => {
        setPlaced((p) => Math.max(p - 1, 0));
        setFeedback(null);
    }, []);

    const handleValidateCount = useCallback(() => {
        // placed + 1 car la pièce active compte dans le total
        const total = placed + 1;

        if (total === s.n) {
            setScore((sc) => sc + 1);
            log("COUNT_OK", { idx, countErrors: countErrCount.current });
            setFeedback({
                type: "ok",
                msg: okCountMsg(s.n, s.pieceLabel, s.tout),
            });
            setTimeout(() => {
                setPhase("name");
                setFeedback(null);
            }, 1800);
        } else if (total < s.n) {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed: total, expected: s.n });
            setFeedback({ type: "err", msg: errCountFew(total, s.n) });
        } else {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed: total, expected: s.n });
            setFeedback({ type: "err", msg: errCountMany(total, s.n) });
        }
    }, [placed, s, idx, log]);

    // ── Handlers phase NAME ───────────────────────────────────────────────────

    const handleSelectName = useCallback(
        (opt) => {
            if (locked) return;
            setLocked(true);

            if (opt === s.answer) {
                setScore((sc) => sc + 1);
                log("NAME_OK", { idx, nameErrors: nameErr });
                setFeedback({
                    type: "ok",
                    msg: okNameMsg(s.n, s.pieceLabel, s.tout, s.answer),
                });
                setTimeout(() => doAdvance(nameErr), 2000);
            } else {
                const ne = nameErr + 1;
                setNameErr(ne);
                log("NAME_ERR", {
                    idx,
                    chosen: opt,
                    answer: s.answer,
                    errN: ne,
                });
                setFeedback({
                    type: "err",
                    msg:
                        ne === 1
                            ? errName1(s.n, `${s.pieceLabel}s`)
                            : errName2(s.n),
                });
                setTimeout(() => {
                    setFeedback(null);
                    setLocked(false);
                }, 2200);
            }
        },
        [locked, s, nameErr, idx, doAdvance, log]
    );

    // ── Rendu ─────────────────────────────────────────────────────────────────

    if (done) {
        return (
            <DoneScreen
                score={score}
                max={MAX_SCORE}
                label="Tangram"
                onReset={reset}
                color={COLOR}
            />
        );
    }

    const isCount = phase === "count";

    return (
        <div className="flex flex-col gap-4">
            {/* En-tête : progression */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {idx + 1}/{TG.length}
                </span>
                <ProgDots done={score} total={MAX_SCORE} color={COLOR} />
            </div>

            {/* Consigne */}
            <div
                className="bg-blue-50 border border-blue-100 rounded-2xl p-3
                      text-center text-lg font-bold text-blue-900 leading-snug"
            >
                {isCount ? (
                    <>
                        Combien de{" "}
                        <em
                            className="not-italic font-extrabold"
                            style={{ color: s.color }}
                        >
                            {s.pieceLabel}
                        </em>{" "}
                        faut-il pour remplir le {s.tout} ?
                    </>
                ) : (
                    <>
                        Ce {s.pieceLabel} représente _____ du {s.tout}.
                    </>
                )}
            </div>

            {/* Visualisation SVG */}
            <div className="flex justify-center">
                <TangramSVG situation={s} placed={placed} overflow={overflow} />
            </div>

            {/* Phase active */}
            {isCount ? (
                <PhaseCount
                    situation={s}
                    placed={placed}
                    overflow={overflow}
                    feedback={feedback}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onValidate={handleValidateCount}
                />
            ) : (
                <PhaseName
                    situation={s}
                    feedback={feedback}
                    onSelect={handleSelectName}
                />
            )}
        </div>
    );
}

AtelierTangram.propTypes = {
    /**
     * Fonction d'émission d'événements vers le journal pédagogique.
     * Signature : log(type: string, data: Object) => void
     * @see useEventLog
     */
    log: PropTypes.func.isRequired,
};
