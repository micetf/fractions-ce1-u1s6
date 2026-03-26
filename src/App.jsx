/**
 * @file App.jsx — composant racine de l'application Fractions CE1.
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
    const urlAtelier = readUrlAtelier();
    const [atelier, setAtelier] = useState(urlAtelier);
    const [totalSits, setTotalSits] = useState(
        urlAtelier ? ATELIERS[urlAtelier].total : 0
    );
    const [showMenu, setShowMenu] = useState(false);
    const [showDash, setShowDash] = useState(false);

    /**
     * Contrôle l'accès à l'onglet Classe :
     * false → bouton 📊 Navbar (élève) — Session uniquement
     * true  → TeacherMenu (appui long) — Session + Classe
     */
    const [dashTeacherMode, setDashTeacherMode] = useState(false);
    const [dashDefaultTab, setDashDefaultTab] = useState("session");
    const [activeStudent, setActiveStudent] = useState(null);
    const [showStudentSelect, setShowStudentSelect] = useState(!!urlAtelier);

    const { events, log, resetLog } = useEventLog();
    const [startTs, setStartTs] = useState(null);
    const holdRef = useRef(null);
    const processedCountRef = useRef(0);

    const { students, addStudent, removeStudent } = useRoster();
    const {
        traces,
        openSession,
        appendSituation,
        markCompleted,
        resetStudent,
        resetStudentAll,
        resetAll,
    } = useStudentTraces();

    // ── Persistance incrémentale (curseur anti-batching React 18) ──────────────

    useEffect(() => {
        if (events.length === 0) {
            processedCountRef.current = 0;
            return;
        }
        if (!activeStudent || !atelier) return;
        const newEvents = events.slice(processedCountRef.current);
        newEvents.forEach((event) => {
            if (event.type === "SIT_DONE")
                appendSituation(
                    atelier,
                    activeStudent.id,
                    buildSnapshot(events, event.data)
                );
            else if (event.type === "ATELIER_DONE")
                markCompleted(atelier, activeStudent.id);
        });
        processedCountRef.current = events.length;
    }, [events, activeStudent, atelier, appendSituation, markCompleted]);

    // ── Sélection atelier ────────────────────────────────────────────────────────

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

    // ── Sélection / changement élève ─────────────────────────────────────────────

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

    const handleChangeStudent = useCallback(() => {
        setActiveStudent(null);
        setShowStudentSelect(true);
        setShowMenu(false);
        setShowDash(false);
        resetLog();
    }, [resetLog]);

    // ── Ouverture Dashboard ──────────────────────────────────────────────────────

    /** Élève — Session uniquement */
    const handleOpenDash = useCallback(() => {
        setDashTeacherMode(false);
        setDashDefaultTab("session");
        setShowDash(true);
        setShowMenu(false);
    }, []);

    /** Enseignant·e — Tableau de bord (session en premier) */
    const handleOpenDashTeacher = useCallback(() => {
        setDashTeacherMode(true);
        setDashDefaultTab("session");
        setShowDash(true);
        setShowMenu(false);
    }, []);

    /** Enseignant·e — Gérer les élèves (onglet Classe direct) */
    const handleManageRoster = useCallback(() => {
        setDashTeacherMode(true);
        setDashDefaultTab("classe");
        setShowDash(true);
        setShowMenu(false);
    }, []);

    const handleCloseDash = useCallback(() => {
        setShowDash(false);
        setDashTeacherMode(false);
        setDashDefaultTab("session");
    }, []);

    // ── Appui long ───────────────────────────────────────────────────────────────

    const startHold = useCallback(() => {
        holdRef.current = setTimeout(() => setShowMenu(true), LONG_PRESS_DELAY);
    }, []);
    const endHold = useCallback(() => clearTimeout(holdRef.current), []);

    // ── Autres handlers TeacherMenu ──────────────────────────────────────────────

    const handleChangeAtel = useCallback(() => {
        resetLog();
        setAtelier(null);
        setActiveStudent(null);
        setShowStudentSelect(false);
        setShowMenu(false);
        history.replaceState(null, "", window.location.pathname);
    }, [resetLog]);

    const handleCloseMenu = useCallback(() => setShowMenu(false), []);

    // ── Écran sélection atelier ──────────────────────────────────────────────────

    if (!atelier) {
        return (
            <div
                className="min-h-screen pt-14"
                style={{ background: "#F1EDE4" }}
            >
                <Navbar />
                <SetupScreen
                    students={students}
                    addStudent={addStudent}
                    removeStudent={removeStudent}
                    traces={traces}
                    onSelect={selectAtelier}
                />
            </div>
        );
    }

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
            </main>

            {showStudentSelect && (
                <StudentSelectScreen
                    students={students}
                    atelierMeta={m}
                    onSelect={handleSelectStudent}
                    addStudent={addStudent}
                    removeStudent={removeStudent}
                    traces={traces}
                />
            )}

            {showMenu && (
                <TeacherMenu
                    onDash={handleOpenDashTeacher}
                    onManage={handleManageRoster}
                    onChange={handleChangeAtel}
                    onChangeStudent={handleChangeStudent}
                    onClose={handleCloseMenu}
                />
            )}

            {showDash && (
                <Dashboard
                    events={events}
                    atelierMeta={{ ...m, total: totalSits }}
                    startTs={startTs}
                    defaultTab={dashDefaultTab}
                    teacherMode={dashTeacherMode}
                    onClose={handleCloseDash}
                    students={students}
                    traces={traces}
                    atelierID={atelier}
                    addStudent={addStudent}
                    removeStudent={removeStudent}
                    resetStudent={resetStudent}
                    resetStudentAll={resetStudentAll}
                    resetAll={resetAll}
                />
            )}
        </div>
    );
}
