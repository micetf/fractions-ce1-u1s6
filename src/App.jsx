/**
 * @file App.jsx — composant racine de l'application Fractions CE1.
 *
 * @description
 * Orchestre les quatre couches de l'application :
 *
 * 1. **Sélection atelier** (`SetupScreen`)        — l'enseignant·e choisit l'atelier
 * 2. **Sélection élève**   (`StudentSelectScreen`) — l'élève s'identifie
 * 3. **Activité**          (AtelierTangram / AtelierDisques / AtelierCuisenaire)
 * 4. **Suivi**             (`Dashboard` à deux onglets + `TeacherMenu`)
 *
 * ────────────────────────────────────────────────────────────────
 * Fin d'atelier — passage de tablette
 * ────────────────────────────────────────────────────────────────
 * `handleChangeStudent` est passé comme `onDone` aux trois ateliers.
 * DoneScreen l'appelle via le bouton "Passer la tablette →", ce qui
 * réouvre StudentSelectScreen sans changer d'atelier.
 *
 * ────────────────────────────────────────────────────────────────
 * Accès à la gestion des élèves — sécurisé
 * ────────────────────────────────────────────────────────────────
 * `handleManageRoster` est désormais passé uniquement à `TeacherMenu`
 * (protégé par l'appui long 2s). Il n'est plus accessible depuis
 * `StudentSelectScreen`.
 *
 * ────────────────────────────────────────────────────────────────
 * Persistance des traces — curseur incrémental
 * ────────────────────────────────────────────────────────────────
 * `processedCountRef` traite tous les nouveaux événements depuis le
 * dernier rendu (résout le batching React 18 de SIT_DONE + ATELIER_DONE).
 *
 * ────────────────────────────────────────────────────────────────
 * Ouverture directe via URL
 * ────────────────────────────────────────────────────────────────
 * `?atelier=tg|dq|cu` bypasse SetupScreen. `TeacherMenu → Changer
 * d'atelier` remet l'URL à son état initial via history.replaceState.
 *
 * @module App
 */

import { useState, useRef, useCallback, useEffect } from "react";

import { useEventLog } from "./hooks/useEventLog.js";
import { useRoster } from "./hooks/useRoster.js";
import { useStudentTraces } from "./hooks/useStudentTraces.js";
import Navbar from "./components/Navbar.jsx";
import SetupScreen from "./components/SetupScreen.jsx";
import TeacherMenu from "./components/TeacherMenu.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import StudentSelectScreen from "./components/roster/StudentSelectScreen.jsx";
import AtelierTangram from "./components/ateliers/AtelierTangram.jsx";
import AtelierDisques from "./components/ateliers/AtelierDisques.jsx";
import AtelierCuisenaire from "./components/ateliers/AtelierCuisenaire.jsx";
import { ATELIERS } from "./data/ateliers.js";

// ─── Constantes ────────────────────────────────────────────────────────────────

const LONG_PRESS_DELAY = 2000;
const VALID_ATELIERS = ["tg", "dq", "cu"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function readUrlAtelier() {
    const p = new URLSearchParams(window.location.search).get("atelier");
    return VALID_ATELIERS.includes(p) ? p : null;
}

/**
 * Reconstruit un SituationSnapshot depuis le journal d'événements.
 *
 * @param {Array}  events
 * @param {Object} sitDoneData - Payload de SIT_DONE
 * @returns {import('./utils/tracesHelpers.js').SituationSnapshot}
 */
function buildSnapshot(events, sitDoneData) {
    const {
        idx,
        label,
        predictCorrect,
        countErrors,
        nameErrors,
        durationMs,
        fullScore,
    } = sitDoneData;
    const start = events.find(
        (e) => e.type === "SIT_START" && e.data.idx === idx
    );
    const distractors = events
        .filter((e) => e.type === "NAME_ERR" && e.data.idx === idx)
        .map((e) => ({ chosen: e.data.chosen, answer: e.data.answer }));
    const status = fullScore
        ? "perfect"
        : nameErrors <= 2
          ? "good"
          : "struggled";
    return {
        idx,
        id: start?.data.id ?? `sit${idx}`,
        label,
        status,
        predictCorrect: predictCorrect ?? null,
        countErrors: countErrors ?? 0,
        nameErrors: nameErrors ?? 0,
        durationMs,
        fullScore,
        distractors,
    };
}

// ─── Composant ─────────────────────────────────────────────────────────────────

export default function App() {
    // ── Navigation ──────────────────────────────────────────────────────────────

    const urlAtelier = readUrlAtelier();
    const [atelier, setAtelier] = useState(urlAtelier);
    const [totalSits, setTotalSits] = useState(
        urlAtelier ? ATELIERS[urlAtelier].total : 0
    );
    const [showMenu, setShowMenu] = useState(false);
    const [showDash, setShowDash] = useState(false);
    const [dashDefaultTab, setDashDefaultTab] = useState("session");
    const [activeStudent, setActiveStudent] = useState(null);
    const [showStudentSelect, setShowStudentSelect] = useState(!!urlAtelier);

    // ── Hooks ────────────────────────────────────────────────────────────────────

    const { events, log, resetLog } = useEventLog();
    const [startTs, setStartTs] = useState(null);
    const holdRef = useRef(null);

    /**
     * Curseur incrémental de persistance.
     * Évite de rater des événements batchés par React 18.
     */
    const processedCountRef = useRef(0);

    const { students, addStudent, removeStudent } = useRoster();
    const {
        traces,
        openSession,
        appendSituation,
        markCompleted,
        resetStudent,
        resetAtelier,
        resetAll,
    } = useStudentTraces();

    // ── Persistance incrémentale des traces ──────────────────────────────────────

    useEffect(() => {
        if (events.length === 0) {
            processedCountRef.current = 0;
            return;
        }
        if (!activeStudent || !atelier) return;

        const newEvents = events.slice(processedCountRef.current);
        newEvents.forEach((event) => {
            if (event.type === "SIT_DONE") {
                appendSituation(
                    atelier,
                    activeStudent.id,
                    buildSnapshot(events, event.data)
                );
            } else if (event.type === "ATELIER_DONE") {
                markCompleted(atelier, activeStudent.id);
            }
        });
        processedCountRef.current = events.length;
    }, [events, activeStudent, atelier, appendSituation, markCompleted]);

    // ── Sélection de l'atelier ───────────────────────────────────────────────────

    const selectAtelier = useCallback(
        (id, total) => {
            resetLog();
            setAtelier(id);
            setTotalSits(total);
            setActiveStudent(null);
            setShowStudentSelect(true);
            history.replaceState(null, "", `?atelier=${id}`);
        },
        [resetLog]
    );

    // ── Sélection / changement d'élève ───────────────────────────────────────────

    const handleSelectStudent = useCallback(
        (student) => {
            resetLog();
            setStartTs(Date.now());
            openSession(atelier, student.id);
            setActiveStudent(student);
            setShowStudentSelect(false);
        },
        [atelier, openSession, resetLog]
    );

    /**
     * Réinitialise la session élève sans changer d'atelier.
     * Appelé depuis TeacherMenu ("Changer d'élève")
     * ET depuis DoneScreen ("Passer la tablette →") via onDone.
     */
    const handleChangeStudent = useCallback(() => {
        setActiveStudent(null);
        setShowStudentSelect(true);
        setShowMenu(false);
        setShowDash(false);
        resetLog();
    }, [resetLog]);

    // ── Gestion du registre ──────────────────────────────────────────────────────

    /** Ouvre le Dashboard sur l'onglet Classe. Accessible via TeacherMenu uniquement. */
    const handleManageRoster = useCallback(() => {
        setDashDefaultTab("classe");
        setShowDash(true);
        setShowMenu(false);
    }, []);

    // ── Appui long ───────────────────────────────────────────────────────────────

    const startHold = useCallback(() => {
        holdRef.current = setTimeout(() => setShowMenu(true), LONG_PRESS_DELAY);
    }, []);

    const endHold = useCallback(() => clearTimeout(holdRef.current), []);

    // ── Handlers TeacherMenu ────────────────────────────────────────────────────

    const handleOpenDash = useCallback(() => {
        setDashDefaultTab("session");
        setShowDash(true);
        setShowMenu(false);
    }, []);

    const handleChangeAtel = useCallback(() => {
        resetLog();
        setAtelier(null);
        setActiveStudent(null);
        setShowStudentSelect(false);
        setShowMenu(false);
        history.replaceState(null, "", window.location.pathname);
    }, [resetLog]);

    const handleCloseMenu = useCallback(() => setShowMenu(false), []);

    const handleCloseDash = useCallback(() => {
        setShowDash(false);
        setDashDefaultTab("session");
    }, []);

    // ── Écran de sélection d'atelier ────────────────────────────────────────────

    if (!atelier) {
        return (
            <div
                className="min-h-screen pt-14"
                style={{ background: "#F1EDE4" }}
            >
                <Navbar />
                <SetupScreen onSelect={selectAtelier} />
            </div>
        );
    }

    // ── Vue atelier ─────────────────────────────────────────────────────────────

    const m = ATELIERS[atelier];
    const hasSitDone = events.some((e) => e.type === "SIT_DONE");

    return (
        <div className="min-h-screen pt-14" style={{ background: "#F1EDE4" }}>
            <Navbar
                atelierMeta={m}
                activeStudent={activeStudent}
                onLongPressStart={startHold}
                onLongPressEnd={endHold}
                onOpenDash={handleOpenDash}
                hasSitDone={hasSitDone}
            />

            <main
                style={{ maxWidth: "680px", margin: "0 auto", padding: "16px" }}
            >
                <div className="bg-white rounded-3xl shadow-lg p-5">
                    {atelier === "tg" && (
                        <AtelierTangram
                            key={`tg-${activeStudent?.id ?? "new"}`}
                            log={log}
                            onDone={handleChangeStudent}
                        />
                    )}
                    {atelier === "dq" && (
                        <AtelierDisques
                            key={`dq-${activeStudent?.id ?? "new"}`}
                            log={log}
                            onDone={handleChangeStudent}
                        />
                    )}
                    {atelier === "cu" && (
                        <AtelierCuisenaire
                            key={`cu-${activeStudent?.id ?? "new"}`}
                            log={log}
                            onDone={handleChangeStudent}
                        />
                    )}
                </div>
                <p className="text-center text-xs text-slate-300 font-semibold mt-4 no-print">
                    Séquence fractions CE1 · Séance 6/6 · CAREC Grenoble · A.
                    Tricot
                </p>
            </main>

            {/* Sélection de l'élève — z-40, sous Navbar z-50 */}
            {showStudentSelect && (
                <StudentSelectScreen
                    students={students}
                    atelierMeta={m}
                    onSelect={handleSelectStudent}
                />
            )}

            {/* Menu enseignant·e — seul point d'accès à la gestion des élèves */}
            {showMenu && (
                <TeacherMenu
                    onDash={handleOpenDash}
                    onManage={handleManageRoster}
                    onChange={handleChangeAtel}
                    onChangeStudent={handleChangeStudent}
                    onClose={handleCloseMenu}
                />
            )}

            {/* Dashboard — startTs nullable, onglet ciblé via defaultTab */}
            {showDash && (
                <Dashboard
                    events={events}
                    atelierMeta={{ ...m, total: totalSits }}
                    startTs={startTs}
                    defaultTab={dashDefaultTab}
                    onClose={handleCloseDash}
                    students={students}
                    traces={traces}
                    atelierID={atelier}
                    addStudent={addStudent}
                    removeStudent={removeStudent}
                    resetStudent={resetStudent}
                    resetAtelier={resetAtelier}
                    resetAll={resetAll}
                />
            )}
        </div>
    );
}
