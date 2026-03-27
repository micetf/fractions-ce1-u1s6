/**
 * @file App.jsx — composant racine de l'application Fractions CE1.
 *
 * @description
 * Machine à états à trois modes exclusifs :
 *
 * ┌──────────┐  confirmation  ┌─────────┐
 * │ VISITOR  │ ─────────────► │ TEACHER │
 * │          │ ◄───── exit ── │         │
 * │          │                └─────────┘
 * │          │  session       ┌─────────┐
 * │          │  active        │ STUDENT │
 * └──────────┘ ─────────────► │         │
 *                    ▲        │ long    │
 *                    │        │ press   │
 *                    │        │ (2s)    │
 *                    │        │  ↓      │
 *                    │        │ confirm │
 *                    └────────┤ overlay │
 *                             └─────────┘
 *
 * Le long press depuis le mode élève affiche `TeacherConfirmOverlay`
 * avant de basculer — même friction que l'entrée depuis VisitorScreen.
 *
 * `StorageToast` est rendu à la racine (hors des trois branches de mode)
 * via un fragment, garantissant sa présence quel que soit le mode actif.
 *
 * @module App
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useEventLog } from "./hooks/useEventLog.js";
import { useRoster } from "./hooks/useRoster.js";
import { useStudentTraces } from "./hooks/useStudentTraces.js";
import { ATELIERS } from "./data/ateliers.js";

import VisitorScreen from "./components/VisitorScreen.jsx";
import TeacherSpace from "./components/teacher/TeacherSpace.jsx";
import StudentSpace from "./components/student/StudentSpace.jsx";
import StorageToast from "./components/ui/StorageToast.jsx"; // ← AJOUT

import {
    STORAGE_KEYS,
    readSession,
    writeSession,
    removeSession,
} from "./utils/storage.js";

// ─── Constantes ────────────────────────────────────────────────────────────────

const LONG_PRESS_DELAY = 2000;
const VALID_ATELIERS = ["tg", "dq", "cu"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Lit le paramètre `?atelier=` dans l'URL.
 * Sert uniquement à orienter l'enseignant vers la bonne vue au premier accès.
 * Ne constitue PAS une session active.
 *
 * @returns {string|null}
 */
function readUrlAtelier() {
    const p = new URLSearchParams(window.location.search).get("atelier");
    return VALID_ATELIERS.includes(p) ? p : null;
}

/**
 * Lit l'atelier de session depuis sessionStorage.
 * Écrit uniquement par handleLaunchSession, effacé par handleStopSession.
 * Survit au refresh de la page — effacé à la fermeture de l'onglet.
 *
 * @returns {string|null}
 */
function readSessionAtelier() {
    const p = readSession(STORAGE_KEYS.SESSION, null);
    return VALID_ATELIERS.includes(p) ? p : null;
}

/**
 * Construit un SituationSnapshot depuis le journal d'événements.
 *
 * @param {import('./hooks/useEventLog').LogEvent[]} events
 * @param {Object} sitDoneData
 * @returns {import('./utils/tracesHelpers').SituationSnapshot}
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
    // ── Machine à états ───────────────────────────────────────────────────────
    const [mode, setMode] = useState("visitor"); // 'visitor' | 'teacher' | 'student'

    // ── État enseignant ───────────────────────────────────────────────────────
    const [teacherView, setTeacherView] = useState("home"); // 'home' | atelierID

    // ── État session ───────────────────────────────────────────────────────────────

    /**
     * Atelier pré-chargé depuis l'URL au démarrage.
     * Lecture seule — oriente l'enseignant vers la bonne vue atelier à l'entrée.
     * N'autorise PAS les élèves à rejoindre une session.
     *
     * @type {string|null}
     */
    const [preloadedAtelier] = useState(readUrlAtelier);

    /**
     * Atelier ouvert aux élèves — null = pas de session active.
     * Initialisé depuis sessionStorage pour survivre aux refreshs de page.
     * Mis à jour UNIQUEMENT par handleLaunchSession / handleStopSession.
     *
     * @type {string|null}
     */
    const [launchedAtelier, setLaunchedAtelier] = useState(readSessionAtelier);

    // ── État élève ────────────────────────────────────────────────────────────
    const [activeStudent, setActiveStudent] = useState(null);
    const [startTs, setStartTs] = useState(null);

    // ── Confirmation retour enseignant (long press depuis mode élève) ─────────
    const [showTeacherConfirm, setShowTeacherConfirm] = useState(false);

    // ── Hooks de données ──────────────────────────────────────────────────────
    const { events, log, resetLog } = useEventLog();

    const {
        students,
        addStudent,
        removeStudent,
        storageError: rosterStorageError, // ← AJOUT
        clearStorageError: clearRosterError, // ← AJOUT
    } = useRoster();

    const {
        traces,
        openSession,
        appendSituation,
        markCompleted,
        resetStudent,
        resetStudentAll,
        resetAll,
        storageError: tracesStorageError, // ← AJOUT
        clearStorageError: clearTracesError, // ← AJOUT
    } = useStudentTraces();

    // ── Erreur de stockage combinée ── ← AJOUT ────────────────────────────────
    const storageError = rosterStorageError || tracesStorageError;

    const handleDismissStorageError = useCallback(() => {
        // ← AJOUT
        clearRosterError();
        clearTracesError();
    }, [clearRosterError, clearTracesError]);

    // ── Refs ──────────────────────────────────────────────────────────────────
    const processedCountRef = useRef(0);
    const holdRef = useRef(null);

    // ── Persistance incrémentale ──────────────────────────────────────────────
    useEffect(() => {
        if (events.length === 0) {
            processedCountRef.current = 0;
            return;
        }
        if (!activeStudent || !launchedAtelier) return;
        const newEvents = events.slice(processedCountRef.current);
        newEvents.forEach((event) => {
            if (event.type === "SIT_DONE")
                appendSituation(
                    launchedAtelier,
                    activeStudent.id,
                    buildSnapshot(events, event.data)
                );
            else if (event.type === "ATELIER_DONE")
                markCompleted(launchedAtelier, activeStudent.id);
        });
        processedCountRef.current = events.length;
    }, [
        events,
        activeStudent,
        launchedAtelier,
        appendSituation,
        markCompleted,
    ]);

    // ── Handlers : mode enseignant ────────────────────────────────────────────

    /** L'enseignant entre dans son espace. */
    const handleEnterTeacher = useCallback(() => {
        setShowTeacherConfirm(false);
        if (mode === "student" && launchedAtelier) {
            // Retour depuis une session en cours → vue de cet atelier
            setTeacherView(launchedAtelier);
        } else if (preloadedAtelier) {
            // Tablette pré-configurée via URL → atterrissage direct
            setTeacherView(preloadedAtelier);
        } else {
            setTeacherView("home");
        }
        setMode("teacher");
    }, [mode, launchedAtelier, preloadedAtelier]);

    /** L'enseignant lance une session dans un atelier. */
    const handleLaunchSession = useCallback(
        (atelierID) => {
            writeSession(STORAGE_KEYS.SESSION, atelierID); // ← persiste dans l'onglet
            setLaunchedAtelier(atelierID);
            setActiveStudent(null);
            setStartTs(null);
            resetLog();
            processedCountRef.current = 0;
            history.replaceState(null, "", `?atelier=${atelierID}`);
            setMode("student");
        },
        [resetLog]
    );

    /** L'enseignant arrête la session en cours. */
    const handleStopSession = useCallback(() => {
        removeSession(STORAGE_KEYS.SESSION); // ← efface la persistance
        setLaunchedAtelier(null);
        setActiveStudent(null);
        setStartTs(null);
        resetLog();
        processedCountRef.current = 0;
        history.replaceState(null, "", window.location.pathname);
        setTeacherView("home");
        setMode("teacher");
    }, [resetLog]);

    /** L'enseignant quitte son espace → retour visiteur. */
    const handleExitTeacher = useCallback(() => {
        setMode("visitor");
    }, []);

    // ── Handlers : mode élève ─────────────────────────────────────────────────

    /** L'élève choisit son prénom. */
    const handleSelectStudent = useCallback(
        (student) => {
            resetLog();
            processedCountRef.current = 0;
            setStartTs(Date.now());
            openSession(launchedAtelier, student.id);
            setActiveStudent(student);
        },
        [launchedAtelier, openSession, resetLog]
    );

    /**
     * L'élève passe la tablette → retour à StudentSelectScreen.
     * La session reste ouverte sur le même atelier.
     */
    const handleNextStudent = useCallback(() => {
        setActiveStudent(null);
        setStartTs(null);
        resetLog();
        processedCountRef.current = 0;
    }, [resetLog]);

    // ── Long press : mode élève → confirmation retour enseignant ─────────────

    const handleLongPressStart = useCallback(() => {
        holdRef.current = setTimeout(() => {
            setShowTeacherConfirm(true);
        }, LONG_PRESS_DELAY);
    }, []);

    const handleLongPressEnd = useCallback(() => {
        clearTimeout(holdRef.current);
    }, []);

    const handleCancelTeacherConfirm = useCallback(() => {
        setShowTeacherConfirm(false);
    }, []);

    // ── Rendu ─────────────────────────────────────────────────────────────────
    const atelierMeta = launchedAtelier ? ATELIERS[launchedAtelier] : null;

    // Contenu principal selon le mode — extrait en variable pour permettre
    // au fragment racine d'accueillir StorageToast dans tous les modes.  // ← AJOUT
    let content;

    if (mode === "teacher") {
        content = (
            <TeacherSpace
                teacherView={teacherView}
                setTeacherView={setTeacherView}
                students={students}
                addStudent={addStudent}
                removeStudent={removeStudent}
                traces={traces}
                resetStudent={resetStudent}
                resetStudentAll={resetStudentAll}
                resetAll={resetAll}
                launchedAtelier={launchedAtelier}
                onLaunchSession={handleLaunchSession}
                onStopSession={handleStopSession}
                onExit={handleExitTeacher}
            />
        );
    } else if (mode === "student") {
        content = (
            <StudentSpace
                atelierMeta={atelierMeta}
                students={students}
                activeStudent={activeStudent}
                events={events}
                startTs={startTs}
                log={log}
                traces={traces}
                launchedAtelier={launchedAtelier}
                onSelectStudent={handleSelectStudent}
                onNextStudent={handleNextStudent}
                onLongPressStart={handleLongPressStart}
                onLongPressEnd={handleLongPressEnd}
                showTeacherConfirm={showTeacherConfirm}
                onConfirmTeacher={handleEnterTeacher}
                onCancelTeacherConfirm={handleCancelTeacherConfirm}
            />
        );
    } else {
        content = (
            <VisitorScreen
                launchedAtelier={launchedAtelier}
                atelierMeta={atelierMeta}
                students={students}
                onEnterTeacher={handleEnterTeacher}
                onEnterStudent={() => setMode("student")}
            />
        );
    }

    // Fragment racine : StorageToast persiste quel que soit le mode actif. // ← AJOUT
    return (
        <>
            {content}
            <StorageToast
                visible={storageError}
                onDismiss={handleDismissStorageError}
            />
        </>
    );
}
