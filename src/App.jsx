/**
 * @file App.jsx — composant racine de l'application Fractions CE1.
 *
 * @description
 * Machine à états fondée sur deux dimensions orthogonales :
 *
 * 1. `teacherAuthed` (boolean, React uniquement)
 *    - false au démarrage et après tout rechargement de page
 *    - true uniquement après long press validé dans AppGate ou depuis StudentSpace
 *
 * 2. `session.active` (boolean, localStorage)
 *    - false → AppGate (enseignant doit lancer une session)
 *    - true  → StudentSpace (élève peut rejoindre ou reprendre)
 *
 * Logique de routage :
 *
 *   teacherAuthed === true          →  TeacherSpace (toutes les vues enseignant)
 *   teacherAuthed === false
 *     session.active === true       →  StudentSpace (sélection + activité)
 *     session.active === false      →  AppGate (attente + long press discret)
 *
 * Déviations assumées par rapport aux specs :
 * - `activeStudentId` est persisté dans localStorage (SESSION) pour permettre
 *   la reprise après rechargement. Les specs prévoient React only.
 * - `startTs` est également persisté pour cohérence des durées.
 *
 * @module App
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useEventLog } from "./hooks/useEventLog.js";
import { useRoster } from "./hooks/useRoster.js";
import { useStudentTraces } from "./hooks/useStudentTraces.js";
import { ATELIERS } from "./data/ateliers.js";
import {
    STORAGE_KEYS,
    readStorage,
    readActiveSession,
    writeActiveSession,
    clearSession,
} from "./utils/storage.js";

import AppGate from "./components/AppGate.jsx";
import TeacherSpace from "./components/teacher/TeacherSpace.jsx";
import StudentSpace from "./components/student/StudentSpace.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Durée de l'appui long pour revenir à l'espace enseignant depuis StudentSpace (ms). */
const LONG_PRESS_DELAY = 1500;

// ─── Helpers d'initialisation ─────────────────────────────────────────────────

/**
 * Réhydrate l'élève actif depuis la session persistée et le roster.
 * Retourne null si la session est inactive, si aucun élève n'est sélectionné,
 * ou si l'élève n'existe plus dans le roster (suppression entre deux séances).
 *
 * @returns {{ id: string, pseudo: string }|null}
 */
function rehydrateActiveStudent() {
    const sess = readActiveSession();
    if (!sess.active || !sess.activeStudentId) return null;
    const roster = readStorage(STORAGE_KEYS.ROSTER, []);
    return roster.find((s) => s.id === sess.activeStudentId) ?? null;
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
    // ── Authentification enseignant (React only — révoquée au rechargement) ───────
    const [teacherAuthed, setTeacherAuthed] = useState(false);
    const [teacherView, setTeacherView] = useState("home");

    // ── Session (initialisée depuis localStorage) ─────────────────────────────────
    const [launchedAtelier, setLaunchedAtelier] = useState(
        () => readActiveSession().atelierID
    );

    // ── Élève courant (réhydraté depuis localStorage + roster) ───────────────────
    const [activeStudent, setActiveStudent] = useState(rehydrateActiveStudent);
    const [startTs, setStartTs] = useState(
        () => readActiveSession().startTs ?? null
    );

    // ── Confirmation retour enseignant (long press depuis StudentSpace) ───────────
    const [showTeacherConfirm, setShowTeacherConfirm] = useState(false);

    // ── Hooks de données ──────────────────────────────────────────────────────────
    const { events, log, resetLog } = useEventLog();
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

    const processedCountRef = useRef(0);
    const holdRef = useRef(null);

    // ── Persistance incrémentale des traces ───────────────────────────────────────
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

    // ── Handlers : accès enseignant ───────────────────────────────────────────────

    /**
     * Long press validé (depuis AppGate ou StudentSpace).
     * `teacherAuthed` passe à true — jamais écrit dans localStorage.
     */
    const handleEnterTeacher = useCallback(() => {
        setShowTeacherConfirm(false);
        // Depuis une session active → atterrir sur la vue de cet atelier
        setTeacherView(launchedAtelier ?? "home");
        setTeacherAuthed(true);
    }, [launchedAtelier]);

    /** Quitter l'espace enseignant → retour vers la vue courante (AppGate ou StudentSpace). */
    const handleExitTeacher = useCallback(() => {
        setTeacherAuthed(false);
    }, []);

    // ── Handlers : cycle de session ───────────────────────────────────────────────

    /**
     * L'enseignant lance une session sur un atelier.
     * Écrit dans localStorage — survit au rechargement.
     */
    const handleLaunchSession = useCallback(
        (atelierID) => {
            writeActiveSession({
                active: true,
                atelierID,
                activeStudentId: null,
                startTs: null,
            });
            setLaunchedAtelier(atelierID);
            setActiveStudent(null);
            setStartTs(null);
            resetLog();
            processedCountRef.current = 0;
            setTeacherAuthed(false); // bascule vers StudentSpace
        },
        [resetLog]
    );

    /**
     * L'enseignant arrête la session en cours.
     * Efface complètement la session dans localStorage.
     */
    const handleStopSession = useCallback(() => {
        clearSession();
        setLaunchedAtelier(null);
        setActiveStudent(null);
        setStartTs(null);
        resetLog();
        processedCountRef.current = 0;
        setTeacherView("home");
        setTeacherAuthed(true); // reste dans l'espace enseignant
    }, [resetLog]);

    // ── Handlers : élève ──────────────────────────────────────────────────────────

    /**
     * L'élève sélectionne son prénom.
     * Persiste `activeStudentId` et `startTs` dans localStorage.
     * (déviation assumée des specs)
     */
    const handleSelectStudent = useCallback(
        (student) => {
            const ts = Date.now();
            resetLog();
            processedCountRef.current = 0;
            openSession(launchedAtelier, student.id);
            writeActiveSession({ activeStudentId: student.id, startTs: ts });
            setStartTs(ts);
            setActiveStudent(student);
        },
        [launchedAtelier, openSession, resetLog]
    );

    /**
     * L'élève passe la tablette → retour à StudentSelectScreen.
     * La session reste active — efface uniquement l'élève courant.
     */
    const handleNextStudent = useCallback(() => {
        writeActiveSession({ activeStudentId: null, startTs: null });
        setActiveStudent(null);
        setStartTs(null);
        resetLog();
        processedCountRef.current = 0;
    }, [resetLog]);

    // ── Long press depuis StudentSpace → confirmation retour enseignant ───────────

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

    // ── Routage ───────────────────────────────────────────────────────────────────

    // 1. Enseignant authentifié → TeacherSpace (toutes les vues)
    if (teacherAuthed) {
        return (
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
    }

    const atelierMeta = launchedAtelier ? ATELIERS[launchedAtelier] : null;

    // 2. Session active → StudentSpace
    if (launchedAtelier) {
        return (
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
    }

    // 3. Pas de session → AppGate (long press discret pour l'enseignant)
    return <AppGate onEnterTeacher={handleEnterTeacher} />;
}
