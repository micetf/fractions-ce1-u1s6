/**
 * @file AtelierTangram — atelier de fractions avec les pièces du Tangram.
 *
 * @description
 * Orchestrateur de la séquence : gère l'état, les handlers et le rendu
 * de haut niveau. Les sous-composants sont délégués à :
 *
 * - TangramSVG          : rendu SVG du carré
 * - TangramPhaseCount   : UI de vérification par manipulation
 * - TangramPhaseName    : UI de nommage de la fraction
 * - PhasePredict        : UI d'anticipation numérique (partagé)
 *
 * ────────────────────────────────────────────────────────────────
 * Flux des phases par situation
 * ────────────────────────────────────────────────────────────────
 *
 *   predict → count → name
 *
 * 1. **predict** — L'élève anticipe le nombre de pièces nécessaires
 *    (boutons 1–10). Aucun feedback immédiat. La consigne est portée
 *    par PhasePredict via la prop `consigne`.
 *
 * 2. **count**   — L'élève vérifie par manipulation. Le feedback
 *    intègre la correction de prédiction :
 *    - `ok`   : prédiction juste ou absente
 *    - `warn` : manipulation réussie, prédiction inexacte
 *
 * 3. **name**    — L'élève nomme la fraction parmi 4 options.
 *
 * ────────────────────────────────────────────────────────────────
 * Scoring
 * ────────────────────────────────────────────────────────────────
 * +1 par phase réussie — max 2 pts/situation = 10 pts total.
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

import PhasePredict from "../ui/PhasePredict.jsx";
import ProgDots from "../ui/ProgDots.jsx";
import DoneScreen from "../ui/DoneScreen.jsx";
import FullModal from "../ui/FullModal.jsx";
import TangramSVG from "./tangram/TangramSVG.jsx";
import TangramPhaseCount from "./tangram/TangramPhaseCount.jsx";
import TangramPhaseName from "./tangram/TangramPhaseName.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

const COLOR = "#2563EB";
const MAX_SCORE = TG.length * 2;

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Atelier Tangram — séquence de 5 situations de fractions du carré.
 *
 * @param {Object}   props
 * @param {Function} props.log - Émetteur d'événements pédagogiques
 */
export default function AtelierTangram({ log, onDone }) {
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

    const s = TG[idx];

    // ── Cycle de vie situation ───────────────────────────────────────────────────

    useEffect(() => {
        sitStart.current = Date.now();
        countErrCount.current = 0;
        log("SIT_START", { idx, id: s.id, label: s.label });
        // phase et predicted réinitialisés dans doAdvance — voir note StrictMode
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

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
                label: s.label,
                n: s.n,
                answer: s.answer,
                predictCorrect: predicted === s.n,
                countErrors: countErrCount.current,
                nameErrors: finalNameErr,
                durationMs: dur,
                fullScore: isFullScore,
            });

            const next = idx + 1;
            if (next < TG.length) {
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
        [idx, s, score, predicted, log]
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
                actual: s.n,
                correct: value === s.n,
            });
            setPhase("count");
        },
        [idx, s.n, log]
    );

    // ── Handlers COUNT ───────────────────────────────────────────────────────────

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

    /**
     * Valide le comptage et construit le feedback en intégrant la
     * correction de prédiction.
     *
     * Cas ok/warn (manipulation réussie) :
     * - predicted === null  → message générique (okCountMsg)
     * - predicted === s.n   → confirmation + félicitation (ok)
     * - predicted !== s.n   → correction sans pénalité (warn)
     */
    const handleValidateCount = useCallback(() => {
        if (placed === s.n) {
            setScore((sc) => sc + 1);
            log("COUNT_OK", { idx, countErrors: countErrCount.current });

            let msg;
            let type;

            if (predicted === null) {
                msg = okCountMsg(s.n, s.pieceLabel, s.tout);
                type = "ok";
            } else if (predicted === s.n) {
                msg = `Tu avais prédit ${s.n} — c'est exact ! Maintenant, nomme la fraction.`;
                type = "ok";
            } else {
                msg = `Tu avais dit ${predicted}, mais en ajoutant tu as trouvé ${s.n}. C'est ça qui compte ! Maintenant, nomme la fraction.`;
                type = "warn";
            }

            setFeedback({ type, msg });
        } else if (placed < s.n) {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed, expected: s.n });
            setFeedback({ type: "err", msg: errCountFew(placed, s.n) });
        } else {
            countErrCount.current++;
            log("COUNT_ERR", { idx, placed, expected: s.n });
            setFeedback({ type: "err", msg: errCountMany(placed, s.n) });
        }
    }, [placed, s, idx, predicted, log]);

    // ── Handlers NAME ─────────────────────────────────────────────────────────────

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
                label="Tangram"
                onReset={reset}
                onDone={onDone}
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
                    {idx + 1}/{TG.length}
                </span>
                <ProgDots done={score} total={MAX_SCORE} color={COLOR} />
            </div>

            {/* ── Consigne — count et name uniquement.
                   Phase predict : PhasePredict porte sa consigne via prop. ── */}
            {!isPredict && (
                <div
                    className="bg-blue-50 border border-blue-100 rounded-2xl p-3
                               text-center text-lg font-bold text-blue-900 leading-snug"
                >
                    {isCount ? (
                        <>
                            Vérifie en ajoutant les{" "}
                            <em
                                className="not-italic font-extrabold"
                                style={{ color: s.color }}
                            >
                                {pluriel(s.pieceLabel)}
                            </em>{" "}
                            un à un.
                        </>
                    ) : (
                        <>
                            Ce {s.pieceLabel} représente _____ du {s.tout}.
                        </>
                    )}
                </div>
            )}

            {/* ── Visualisation : tout + modèle de la part ── */}
            {/*
                Les deux SVGs partagent viewBox="0 0 200 200" et size=150px CSS.
                150 + 150 + gap ≈ 316px → tient sur un écran 375px.
                La part est tournée de s.rot° autour du centre (100,100) pour
                briser toute orientation prototypique. Le viewBox élargi
                "-20 -20 240 240" évite le clipping des coins lors de la rotation.
            */}
            <div className="flex items-end justify-center gap-4">
                {/* Le tout : carré à remplir progressivement */}
                <div className="flex flex-col items-center gap-1">
                    <TangramSVG situation={s} placed={placed} size={150} />
                    <span className="text-xs font-semibold text-slate-400">
                        le {s.tout}
                    </span>
                </div>

                {/* Le modèle de la part — rotation non-prototypique */}
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

            {/* ── Phase active ── */}

            {isPredict && (
                <PhasePredict
                    consigne={
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
                    }
                    onPredict={handlePredict}
                    color={s.color}
                />
            )}

            {isCount && (
                <TangramPhaseCount
                    situation={s}
                    placed={placed}
                    feedback={feedback}
                    onContinue={handleCountContinue}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onValidate={handleValidateCount}
                />
            )}

            {!isPredict && !isCount && (
                <TangramPhaseName
                    situation={s}
                    feedback={feedback}
                    onContinue={handleNameContinue}
                    onSelect={handleSelectName}
                />
            )}

            {/* ── Modale "carré déjà rempli" ── */}
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
    onDone: PropTypes.func.isRequired,
};
