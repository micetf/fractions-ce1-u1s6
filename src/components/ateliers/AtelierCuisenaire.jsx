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
 * Corrections visuelles (v3)
 * ────────────────────────────────────────────────────────────────
 * - Bac à fond sombre (#1E293B) : toutes les réglettes ressortent,
 *   y compris la réglette blanche (#F9FAFB).
 * - Séparateurs blancs semi-transparents (rgba(255,255,255,0.2)).
 * - Bac sans border CSS (box-shadow inset) : la largeur interne
 *   est exactement refLen × UNIT, garantissant l'alignement.
 * - "La partie →" affichée en permanence comme référence.
 *
 * ────────────────────────────────────────────────────────────────
 * Invariant géométrique
 * ────────────────────────────────────────────────────────────────
 * Pour toutes les situations unitaires :
 *   n × c.len × UNIT = c.refLen × UNIT
 *
 * ────────────────────────────────────────────────────────────────
 * Scoring
 * ────────────────────────────────────────────────────────────────
 * Situations unitaires   : 2 pts chacune (comptage + nommage)
 * Situation non-unitaire : 1 pt (nommage uniquement)
 * Total = CUI.length * 2 - 1 = 11 pts
 *
 * @see useEventLog
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
import DoneScreen from "../ui/DoneScreen.jsx";
import FullModal from "../ui/FullModal.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

const COLOR = "#B45309";
const MAX_SCORE = CUI.length * 2 - 1;

/** Couleur de fond du bac : ardoise sombre pour contraste maximal. */
const BAC_BG = "#1E293B";

// ─── Rod ───────────────────────────────────────────────────────────────────────

/**
 * Réglette Cuisenaire individuelle (composant standalone).
 * Utilisée pour les lignes de référence ("Le tout →", "La partie →").
 *
 * @param {Object}      props
 * @param {number}      props.len   - Longueur en unités
 * @param {string}      props.bg    - Couleur de fond
 * @param {string}      props.bd    - Couleur de bordure
 * @param {string|null} props.label - Label à gauche (null = pas de label)
 */
function Rod({ len, bg, bd, label }) {
    return (
        <div className="flex items-center gap-2">
            {label !== null && (
                <span
                    className="text-xs font-bold text-slate-400 shrink-0"
                    style={{ width: "80px", textAlign: "right" }}
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
// ─── DarkRod ────────────────────────────────────────────────────────────────────

/**
 * Réglette Cuisenaire sur fond ardoise (version compacte sans label).
 * Utilisée dans RodVisualizer pour les comparaisons dans le bac sombre.
 *
 * @param {Object} props
 * @param {number} props.len - Longueur en unités
 * @param {string} props.bg  - Couleur de fond
 * @param {string} props.bd  - Couleur de bordure
 */
function DarkRod({ len, bg, bd }) {
    return (
        <div
            style={{
                width: `${len * UNIT}px`,
                height: "36px",
                background: bg,
                border: `2px solid ${bd}`,
                borderRadius: "6px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                    len === 1
                        ? "rgba(255,255,255,0.4)"
                        : "rgba(255,255,255,0.9)",
                fontSize: "11px",
                fontWeight: 700,
            }}
        >
            {len > 1 ? len : ""}
        </div>
    );
}

DarkRod.propTypes = {
    len: PropTypes.number.isRequired,
    bg: PropTypes.string.isRequired,
    bd: PropTypes.string.isRequired,
};

// ─── RodVisualizer ─────────────────────────────────────────────────────────────

/**
 * Zone de visualisation des réglettes Cuisenaire.
 *
 * @description
 * Tout l'espace est sur fond ardoise (`#1E293B`), comme une table sombre.
 *
 * Phases `count` et `name` — structure dans le fond ardoise :
 * ```
 * [réglette orange, largeur = refLen × UNIT]
 * [réglettes qui s'accumulent bout à bout, même point de départ gauche]
 * ```
 * Quand placed = n, les réglettes couvrent exactement la même longueur
 * que l'orange : invariant `n × c.len × UNIT = c.refLen × UNIT`.
 *
 * La réglette modèle ("La partie →") est affichée HORS du fond ardoise,
 * dans une bande blanche au-dessus, comme référence manipulable.
 *
 * Phase `explain` — entièrement dans le fond ardoise :
 * orange + violette + décomposition en 2 rouges.
 *
 * ────────────────────────────────────────────────────────────────
 * Invariant géométrique
 * ────────────────────────────────────────────────────────────────
 *   n × c.len × UNIT = c.refLen × UNIT
 * Aucune border CSS sur le fond ardoise : largeur ext = largeur interne.
 *
 * @param {Object}  props
 * @param {Object}  props.situation - Données de la situation
 * @param {number}  props.placed    - Réglettes posées (0..n)
 * @param {string}  props.phase     - Phase courante ('count'|'name'|'explain')
 */
function RodVisualizer({ situation: c, placed, phase }) {
    const rodW = c.refLen * UNIT;
    // Largeur min = réglette + padding intérieur (16px × 2)
    const minW = rodW + 32;

    return (
        <div className="rounded-2xl overflow-hidden shadow-sm">
            {/* ── Bande blanche : réglette modèle "La partie" — hors zone ardoise ── */}
            {phase !== "explain" && (
                <div className="bg-white px-4 py-2.5 flex items-center gap-3 border-b border-slate-100">
                    <span
                        className="text-xs font-bold text-slate-400 shrink-0"
                        style={{ width: "72px", textAlign: "right" }}
                    >
                        La partie →
                    </span>
                    <div
                        style={{
                            width: `${c.len * UNIT}px`,
                            height: "30px",
                            background: c.bg,
                            border: `2px solid ${c.bd}`,
                            borderRadius: "6px",
                            flexShrink: 0,
                        }}
                    />
                </div>
            )}

            {/* ── Fond ardoise : comparaison visuelle ── */}
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
                    {phase !== "explain" ? (
                        <>
                            {/* Réglette de référence (le tout) */}
                            <DarkRod len={c.refLen} bg={c.refBg} bd={c.refBd} />

                            {/*
                Zone d'accumulation — même largeur que l'orange.
                Fond légèrement plus clair pour que l'espace vide reste lisible.
                Les réglettes poussent depuis la gauche jusqu'à couvrir l'orange.
              */}
                            <div
                                style={{
                                    width: `${rodW}px`,
                                    height: "36px",
                                    borderRadius: "6px",
                                    background: "rgba(255,255,255,0.06)",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                    display: "flex",
                                }}
                                aria-label={
                                    placed === 0
                                        ? "Vide — ajouter des réglettes"
                                        : `${placed} réglette${placed > 1 ? "s" : ""}`
                                }
                            >
                                {Array.from({ length: placed }).map((_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: `${c.len * UNIT}px`,
                                            height: "100%",
                                            background: c.bg,
                                            /* Séparateur inclus dans box-sizing:border-box → pas de décalage */
                                            borderRight:
                                                i < placed - 1
                                                    ? "1px solid rgba(255,255,255,0.2)"
                                                    : "none",
                                            flexShrink: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color:
                                                c.len === 1
                                                    ? "rgba(255,255,255,0.4)"
                                                    : "rgba(255,255,255,0.9)",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {c.len > 1 ? c.len : ""}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        /* ── Phase explain : orange + violette + décomposition ── */
                        <>
                            <DarkRod len={c.refLen} bg={c.refBg} bd={c.refBd} />
                            <DarkRod len={c.len} bg={c.bg} bd={c.bd} />

                            {/* 2 réglettes rouges = décomposition de la violette */}
                            <div style={{ display: "flex", gap: "3px" }}>
                                <DarkRod len={2} bg="#EF4444" bd="#B91C1C" />
                                <DarkRod len={2} bg="#EF4444" bd="#B91C1C" />
                            </div>

                            <p
                                style={{
                                    color: "rgba(255,255,255,0.45)",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    marginTop: "2px",
                                }}
                            >
                                Rouge = un cinquième de l'orange → Violette = ?
                            </p>
                        </>
                    )}
                </div>
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

// ─── PhaseCount ────────────────────────────────────────────────────────────────

/**
 * Interface de la phase de comptage pour l'atelier Cuisenaire.
 *
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation
 * @param {number}   props.placed     - Réglettes posées (0..n)
 * @param {boolean}  props.hintShown  - Indice déjà affiché
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Transition vers la phase name
 * @param {Function} props.onAdd      - Ajouter une réglette
 * @param {Function} props.onRemove   - Retirer une réglette
 * @param {Function} props.onHint     - Afficher l'indice
 * @param {Function} props.onValidate - Valider le comptage
 */
function PhaseCount({
    situation: c,
    placed,
    hintShown,
    feedback,
    onContinue,
    onAdd,
    onRemove,
    onHint,
    onValidate,
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onAdd}
                    aria-label="Ajouter une réglette"
                    className="btn-add flex-1 py-4 rounded-2xl text-2xl font-bold text-white
                     shadow-md touch-manipulation"
                    style={{ background: COLOR }}
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
                    style={{ background: "#92400E" }}
                >
                    ✓ La réglette {c.refName} est couverte !
                </button>
            )}
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
    onContinue: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onHint: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
};

PhaseCount.defaultProps = { feedback: null };

// ─── PhaseName ─────────────────────────────────────────────────────────────────

/**
 * Interface de la phase de nommage (situations unitaires et non-unitaire).
 *
 * @param {Object}   props
 * @param {Object}   props.situation  - Données de la situation
 * @param {Object}   props.feedback   - { type, msg } | null
 * @param {Function} props.onContinue - Avancement à la situation suivante
 * @param {Function} props.onSelect   - Callback(option: string)
 */
function PhaseName({ situation: c, feedback, onContinue, onSelect }) {
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
                {c.fOpts.map((opt) => {
                    let v = "idle";
                    if (feedback && feedback.type === "ok") {
                        v = opt === c.answer ? "ok" : "off";
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
        type: PropTypes.string,
        msg: PropTypes.string,
    }),
    onContinue: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
};

PhaseName.defaultProps = { feedback: null };

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Atelier Cuisenaire — séquence de 6 situations de fractions des réglettes.
 *
 * @param {Object}   props
 * @param {Function} props.log - Émetteur d'événements pédagogiques
 */
export default function AtelierCuisenaire({ log }) {
    const [idx, setIdx] = useState(0);
    const [placed, setPlaced] = useState(0);
    const [phase, setPhase] = useState("count");
    const [feedback, setFeedback] = useState(null);
    const [locked, setLocked] = useState(false);
    const [showFullModal, setShowFullModal] = useState(false);
    const [nameErr, setNameErr] = useState(0);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);
    const [hintShown, setHintShown] = useState(false);

    const sitStart = useRef(Date.now());
    const countErrCount = useRef(0);

    const c = CUI[idx];

    useEffect(() => {
        sitStart.current = Date.now();
        countErrCount.current = 0;
        setHintShown(false);
        setPlaced(0);
        setFeedback(null);
        setLocked(false);
        setNameErr(0);
        setShowFullModal(false);
        setPhase(c.nonUnit ? "explain" : "count");
        log("SIT_START", {
            idx,
            id: `cu${idx}`,
            label: `Réglette ${c.name} / ${c.refName}`,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

    const reset = useCallback(() => {
        setIdx(0);
        setScore(0);
        setDone(false);
    }, []);

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

    // ── Handlers COUNT ──────────────────────────────────────────────────────────

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

    // ── Handlers NAME ────────────────────────────────────────────────────────────

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
                    onContinue={handleCountContinue}
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
                    onContinue={handleNameContinue}
                    onSelect={handleSelectName}
                />
            )}

            {/* Modale "réglette déjà couverte" */}
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
