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
 * Contrôle d'accès au Dashboard
 * ────────────────────────────────────────────────────────────────
 * `dashTeacherMode` contrôle la visibilité de l'onglet "Suivi classe" :
 *
 * - false : ouverture via bouton 📊 Navbar → Session uniquement.
 *           Accessible à l'élève, aucune donnée sensible exposée.
 * - true  : ouverture via TeacherMenu (appui long 2s protégé)
 *           → Session + Classe (RosterManager, ClassTracker, resets).
 *
 * ────────────────────────────────────────────────────────────────
 * Fin d'atelier — passage de tablette
 * ────────────────────────────────────────────────────────────────
 * `handleChangeStudent` est passé comme `onDone` aux trois ateliers.
 * DoneScreen l'appelle via "Passer la tablette →".
 * Les ateliers sont remontés via clé dynamique incluant l'ID de l'élève.
 *
 * ────────────────────────────────────────────────────────────────
 * Persistance des traces — curseur incrémental
 * ────────────────────────────────────────────────────────────────
 * `processedCountRef` traite tous les nouveaux événements depuis le
 * dernier rendu (résout le batching React 18 de SIT_DONE + ATELIER_DONE).
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

    /**
     * false : accès élève via bouton 📊 — Session uniquement.
     * true  : accès enseignant·e via TeacherMenu — Session + Classe.
     */
    const [dashTeacherMode, setDashTeacherMode] = useState(false);

    /** Onglet affiché à l'ouverture du Dashboard. */
    const [dashDefaultTab, setDashDefaultTab] = useState("session");

    /** Élève actif — null = StudentSelectScreen affiché. */
    const [activeStudent, setActiveStudent] = useState(null);
    const [showStudentSelect, setShowStudentSelect] = useState(!!urlAtelier);

    // ── Hooks ────────────────────────────────────────────────────────────────────

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
        resetAtelier,
        resetAll,
    } = useStudentTraces();

    // ── Persistance incrémentale ─────────────────────────────────────────────────

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
     * Appelé depuis :
     * - TeacherMenu → "Changer d'élève"
     * - DoneScreen  → "Passer la tablette →" (via onDone)
     */
    const handleChangeStudent = useCallback(() => {
        setActiveStudent(null);
        setShowStudentSelect(true);
        setShowMenu(false);
        setShowDash(false);
        resetLog();
    }, [resetLog]);

    // ── Accès au Dashboard ───────────────────────────────────────────────────────

    /**
     * Ouverture élève (bouton 📊 Navbar) — Session uniquement, pas de données sensibles.
     */
    const handleOpenDash = useCallback(() => {
        setDashTeacherMode(false);
        setDashDefaultTab("session");
        setShowDash(true);
        setShowMenu(false);
    }, []);

    /**
     * Ouverture enseignant·e via TeacherMenu → "Tableau de bord".
     * Session + Classe visibles.
     */
    const handleOpenDashTeacher = useCallback(() => {
        setDashTeacherMode(true);
        setDashDefaultTab("session");
        setShowDash(true);
        setShowMenu(false);
    }, []);

    /**
     * Ouverture enseignant·e via TeacherMenu → "Gérer les élèves".
     * Ouvre directement sur l'onglet Classe.
     */
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

            {/* Menu enseignant·e — seul point d'accès aux fonctions protégées */}
            {showMenu && (
                <TeacherMenu
                    onDash={handleOpenDashTeacher}
                    onManage={handleManageRoster}
                    onChange={handleChangeAtel}
                    onChangeStudent={handleChangeStudent}
                    onClose={handleCloseMenu}
                />
            )}

            {/* Dashboard — teacherMode contrôle la visibilité de l'onglet Classe */}
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
                    resetAtelier={resetAtelier}
                    resetAll={resetAll}
                />
            )}
        </div>
    );
}
