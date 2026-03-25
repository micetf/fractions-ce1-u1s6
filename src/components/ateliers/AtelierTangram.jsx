/**
 * @file AtelierTangram — atelier de fractions avec les pièces du Tangram.
 *
 * @description
 * Activité en deux phases enchaînées pour chaque situation :
 *
 * 1. **Phase `count`** — Le carré commence vide. L'élève ajoute des pièces une
 *    à une jusqu'à le remplir entièrement, puis valide. Une pièce de référence
 *    (toujours visible) rappelle la pièce à manipuler.
 *
 * 2. **Phase `name`**  — L'élève choisit parmi 4 options le nom de la fraction
 *    que représente la pièce de référence.
 *
 * ────────────────────────────────────────────────────────────────
 * Modèle de remplissage
 * ────────────────────────────────────────────────────────────────
 * `placed` va de 0 (carré vide) à s.n (carré plein).
 * Ordre : position « active » en premier, puis chaque ghost.
 * Tenter d'ajouter quand placed === s.n → FullModal.
 *
 * ────────────────────────────────────────────────────────────────
 * Scoring
 * ────────────────────────────────────────────────────────────────
 * +1 point par phase réussie (max 2 points/situation = 10 points).
 *
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
    pluriel,
} from "../../utils/feedback.js";
import Btn from "../ui/Btn.jsx";
import Bubble from "../ui/Bubble.jsx";
import ProgDots from "../ui/ProgDots.jsx";
import DoneScreen from "../ui/DoneScreen.jsx";
import FullModal from "../ui/FullModal.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

const COLOR = "#2563EB";
const MAX_SCORE = TG.length * 2;

// ─── TangramSVG ────────────────────────────────────────────────────────────────

/**
 * Carré Tangram progressivement rempli.
 *
 * placed=0 → carré vide (fantômes très atténués).
 * placed=s.n → carré entièrement rempli.
 * Ordre de remplissage : [active, ...ghosts].
 *
 * @param {{ situation: Object, placed: number }} props
 */
function TangramSVG({ situation: s, placed, size = 200 }) {
    const allPieces = [s.active, ...s.ghosts]; // longueur = s.n

    return (
        <svg
            viewBox="0 0 200 200"
            aria-label={`Carré Tangram — ${placed} pièce${placed > 1 ? "s" : ""} posée${placed > 1 ? "s" : ""}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                filter: "drop-shadow(0 4px 14px rgba(0,0,0,.12))",
            }}
        >
            <rect
                x="10"
                y="10"
                width="180"
                height="180"
                fill="#F8FAFC"
                rx="2"
            />

            {allPieces.map((pts, i) => (
                <polygon
                    key={i}
                    points={pts}
                    fill={i < placed ? s.color : s.ghostC}
                    opacity={i < placed ? 0.85 : 0.12}
                    stroke="white"
                    strokeWidth="1.5"
                />
            ))}

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
    size: PropTypes.number,
};

// ─── PhaseCount ────────────────────────────────────────────────────────────────

/**
 * Interface de la phase de comptage.
 *
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation
 * @param {number}   props.placed     - Pièces placées (0..s.n)
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Transition vers la phase name
 * @param {Function} props.onAdd      - Ajouter une pièce
 * @param {Function} props.onRemove   - Retirer une pièce
 * @param {Function} props.onValidate - Valider le comptage
 */
function PhaseCount({
    situation: s,
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
                    aria-label="Ajouter une pièce"
                    className="btn-add flex-1 py-4 rounded-2xl text-2xl font-bold text-white
                     shadow-md touch-manipulation"
                    style={{ background: s.color }}
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
        color: PropTypes.string.isRequired,
        tout: PropTypes.string.isRequired,
    }).isRequired,
    placed: PropTypes.number.isRequired,
    feedback: PropTypes.shape({
        type: PropTypes.oneOf(["ok", "err", "hint"]).isRequired,
        msg: PropTypes.string.isRequired,
    }),
    onContinue: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
};

PhaseCount.defaultProps = { feedback: null };

// ─── PhaseName ─────────────────────────────────────────────────────────────────

/**
 * Interface de la phase de nommage.
 *
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Avancement à la situation suivante
 * @param {Function} props.onSelect   - Callback(option: string)
 */
function PhaseName({ situation: s, feedback, onContinue, onSelect }) {
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
                {s.fOpts.map((opt) => {
                    let v = "idle";
                    if (feedback && feedback.type === "ok") {
                        v = opt === s.answer ? "ok" : "off";
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
    onContinue: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
};

PhaseName.defaultProps = { feedback: null };

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Atelier Tangram — séquence de 5 situations de fractions du carré.
 *
 * @param {Object}   props
 * @param {Function} props.log - Émetteur d'événements pédagogiques
 */
export default function AtelierTangram({ log }) {
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

    const s = TG[idx];

    useEffect(() => {
        sitStart.current = Date.now();
        countErrCount.current = 0;
        log("SIT_START", { idx, id: s.id, label: s.label });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

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
                    totalScore: score,
                    maxScore: MAX_SCORE,
                    durationMs: dur,
                });
            }
        },
        [idx, s, score, log]
    );

    // ── Handlers COUNT ──────────────────────────────────────────────────────────

    /** Ajouter : déclenche la modale si le carré est déjà plein. */
    const handleAdd = useCallback(() => {
        if (placed >= s.n) {
            setShowFullModal(true);
        } else {
            setPlaced((p) => p + 1);
        }
        setFeedback(null);
    }, [placed, s.n]);

    const handleRemove = useCallback(() => {
        setPlaced((p) => Math.max(p - 1, 0));
        setFeedback(null);
    }, []);

    const handleValidateCount = useCallback(() => {
        if (placed === s.n) {
            setScore((sc) => sc + 1);
            log("COUNT_OK", { idx, countErrors: countErrCount.current });
            setFeedback({
                type: "ok",
                msg: okCountMsg(s.n, s.pieceLabel, s.tout),
            });
        } else if (placed < s.n) {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed, expected: s.n });
            setFeedback({ type: "err", msg: errCountFew(placed, s.n) });
        } else {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed, expected: s.n });
            setFeedback({ type: "err", msg: errCountMany(placed, s.n) });
        }
    }, [placed, s, idx, log]);

    // ── Handlers NAME ────────────────────────────────────────────────────────────

    const handleSelectName = useCallback(
        (opt) => {
            if (locked) return;

            if (opt === s.answer) {
                setLocked(true);
                setScore((sc) => sc + 1);
                log("NAME_OK", { idx, nameErrors: nameErr });
                setFeedback({
                    type: "ok",
                    msg: okNameMsg(s.n, s.pieceLabel, s.tout, s.answer),
                });
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
                            ? errName1(s.n, pluriel(s.pieceLabel))
                            : errName2(s.n),
                });
            }
        },
        [locked, s, nameErr, idx, log]
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
                label="Tangram"
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
                            {pluriel(s.pieceLabel)}
                        </em>{" "}
                        faut-il pour remplir le {s.tout} ?
                    </>
                ) : (
                    <>
                        Ce {s.pieceLabel} représente _____ du {s.tout}.
                    </>
                )}
            </div>

            {/* ── Visualisation : tout à couvrir + modèle de la part, même échelle ── */}
            {/*
        Les deux SVGs partagent viewBox="0 0 200 200" et size=150px CSS.
        150 + 150 + gap ≈ 316px → tient sur un écran 375px.
        La part est tournée de s.rot° autour du centre (100,100) pour briser
        toute orientation prototypique. Le viewBox élargi "-20 -20 240 240"
        sur le modèle évite le clipping des coins lors de la rotation.
      */}
            <div className="flex items-end justify-center gap-4">
                {/* Le tout : carré à remplir progressivement */}
                <div className="flex flex-col items-center gap-1">
                    <TangramSVG situation={s} placed={placed} size={150} />
                    <span className="text-xs font-semibold text-slate-400">
                        le {s.tout}
                    </span>
                </div>

                {/* Le modèle de la part : même taille CSS, rotation non-prototypique */}
                <div className="flex flex-col items-center gap-1">
                    <svg
                        viewBox="-20 -20 240 240"
                        aria-label={`Modèle : ${s.pieceLabel}`}
                        style={{
                            width: "150px",
                            height: "150px",
                            flexShrink: 0,
                        }}
                    >
                        <polygon
                            points={s.active}
                            fill={s.color}
                            opacity={0.9}
                            stroke="white"
                            strokeWidth="2"
                            transform={`rotate(${s.rot}, 100, 100)`}
                        />
                    </svg>
                    <span
                        className="text-xs font-semibold"
                        style={{ color: s.color }}
                    >
                        {s.pieceLabel}
                    </span>
                </div>
            </div>

            {/* Phase active */}
            {isCount ? (
                <PhaseCount
                    situation={s}
                    placed={placed}
                    feedback={feedback}
                    onContinue={handleCountContinue}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onValidate={handleValidateCount}
                />
            ) : (
                <PhaseName
                    situation={s}
                    feedback={feedback}
                    onContinue={handleNameContinue}
                    onSelect={handleSelectName}
                />
            )}

            {/* Modale "carré déjà rempli" */}
            {showFullModal && (
                <FullModal
                    message={`Le ${s.tout} est déjà rempli ! Il n'est plus nécessaire d'ajouter.`}
                    color={COLOR}
                    onClose={() => setShowFullModal(false)}
                />
            )}
        </div>
    );
}

AtelierTangram.propTypes = {
    log: PropTypes.func.isRequired,
};
