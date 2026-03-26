/**
 * @file StudentSpace.jsx — orchestrateur de l'espace élève.
 *
 * @description
 * Gère deux sous-états :
 * - `activeStudent === null` → StudentSelectScreen (choix du prénom)
 * - `activeStudent !== null` → Atelier actif + Dashboard résultats propres
 *
 * La Navbar est présente dans les deux cas. Sur l'écran de sélection,
 * la zone centrale affiche le badge atelier (sans badge élève) et le
 * long press fonctionne déjà — permettant à l'enseignant de reprendre
 * la main même avant qu'un élève ait été sélectionné.
 *
 * @module student/StudentSpace
 */

import { useState } from "react";
import PropTypes from "prop-types";
import Navbar from "../Navbar.jsx";
import StudentSelectScreen from "../roster/StudentSelectScreen.jsx";
import AtelierTangram from "../ateliers/AtelierTangram.jsx";
import AtelierDisques from "../ateliers/AtelierDisques.jsx";
import AtelierCuisenaire from "../ateliers/AtelierCuisenaire.jsx";
import Dashboard from "../dashboard/Dashboard.jsx";
import TeacherConfirmOverlay from "../ui/TeacherConfirmOverlay.jsx";

/**
 * @param {Object}      props
 * @param {Object}      props.atelierMeta            - Métadonnées de l'atelier actif
 * @param {Array}       props.students               - Liste des élèves
 * @param {Object|null} props.activeStudent          - Élève actif (null → select screen)
 * @param {Array}       props.events                 - Journal d'événements en cours
 * @param {number|null} props.startTs                - Timestamp de démarrage session
 * @param {Function}    props.log                    - Émet un événement
 * @param {Object}      props.traces                 - Store de traces (lecture seule)
 * @param {string}      props.launchedAtelier        - ID de l'atelier en session
 * @param {Function}    props.onSelectStudent        - L'élève choisit son prénom
 * @param {Function}    props.onNextStudent          - Passer la tablette
 * @param {Function}    props.onLongPressStart       - Début appui long
 * @param {Function}    props.onLongPressEnd         - Fin appui long
 * @param {boolean}     props.showTeacherConfirm     - Affiche l'overlay de confirmation
 * @param {Function}    props.onConfirmTeacher       - Bascule en mode enseignant
 * @param {Function}    props.onCancelTeacherConfirm - Annule et reste en mode élève
 * @returns {JSX.Element}
 */
export default function StudentSpace({
    atelierMeta,
    students,
    activeStudent,
    events,
    startTs,
    log,
    launchedAtelier,
    onSelectStudent,
    onNextStudent,
    onLongPressStart,
    onLongPressEnd,
    showTeacherConfirm,
    onConfirmTeacher,
    onCancelTeacherConfirm,
}) {
    const [showDash, setShowDash] = useState(false);
    const hasSitDone = events.some((e) => e.type === "SIT_DONE");

    // ── Navbar partagée par les deux sous-états ────────────────────────────────
    // Présente dès l'écran de sélection : badge atelier visible, long press actif.
    const navbar = (
        <Navbar
            mode="student"
            atelierMeta={atelierMeta}
            activeStudent={activeStudent} // null sur select screen → pas de badge élève
            onLongPressStart={onLongPressStart}
            onLongPressEnd={onLongPressEnd}
            hasSitDone={hasSitDone}
            onOpenDash={activeStudent ? () => setShowDash(true) : null}
        />
    );

    // ── Écran de sélection ────────────────────────────────────────────────────
    if (!activeStudent) {
        return (
            <>
                {navbar}
                <div
                    className="min-h-screen pt-14"
                    style={{ background: "#F1EDE4" }}
                >
                    <StudentSelectScreen
                        students={students}
                        atelierMeta={atelierMeta}
                        onSelect={onSelectStudent}
                    />
                </div>

                {showTeacherConfirm && (
                    <TeacherConfirmOverlay
                        onConfirm={onConfirmTeacher}
                        onCancel={onCancelTeacherConfirm}
                    />
                )}
            </>
        );
    }

    // ── Atelier actif ─────────────────────────────────────────────────────────
    return (
        <>
            <div
                className="min-h-screen pt-14"
                style={{ background: "#F1EDE4" }}
            >
                {navbar}

                <main
                    style={{
                        maxWidth: "680px",
                        margin: "0 auto",
                        padding: "16px",
                    }}
                >
                    <div className="bg-white rounded-3xl shadow-lg p-5">
                        {launchedAtelier === "tg" && (
                            <AtelierTangram
                                key={`tg-${activeStudent.id}`}
                                log={log}
                                onDone={onNextStudent}
                            />
                        )}
                        {launchedAtelier === "dq" && (
                            <AtelierDisques
                                key={`dq-${activeStudent.id}`}
                                log={log}
                                onDone={onNextStudent}
                            />
                        )}
                        {launchedAtelier === "cu" && (
                            <AtelierCuisenaire
                                key={`cu-${activeStudent.id}`}
                                log={log}
                                onDone={onNextStudent}
                            />
                        )}
                    </div>
                </main>
            </div>

            {/* Dashboard élève — session propre uniquement */}
            {showDash && (
                <Dashboard
                    events={events}
                    atelierMeta={{ ...atelierMeta, total: atelierMeta.total }}
                    startTs={startTs}
                    activeStudent={activeStudent}
                    defaultTab="session"
                    teacherMode={false}
                    onClose={() => setShowDash(false)}
                    /* Props enseignant neutralisées */
                    students={[]}
                    traces={{}}
                    atelierID={launchedAtelier}
                    addStudent={() => {}}
                    removeStudent={() => {}}
                    resetStudent={() => {}}
                    resetStudentAll={() => {}}
                    resetAll={() => {}}
                />
            )}

            {/* Overlay de confirmation retour enseignant (long press) */}
            {showTeacherConfirm && (
                <TeacherConfirmOverlay
                    onConfirm={onConfirmTeacher}
                    onCancel={onCancelTeacherConfirm}
                />
            )}
        </>
    );
}

StudentSpace.propTypes = {
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        border: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
    }).isRequired,
    students: PropTypes.array.isRequired,
    activeStudent: PropTypes.shape({
        id: PropTypes.string.isRequired,
        pseudo: PropTypes.string.isRequired,
    }),
    events: PropTypes.array.isRequired,
    startTs: PropTypes.number,
    log: PropTypes.func.isRequired,
    traces: PropTypes.object.isRequired,
    launchedAtelier: PropTypes.string.isRequired,
    onSelectStudent: PropTypes.func.isRequired,
    onNextStudent: PropTypes.func.isRequired,
    onLongPressStart: PropTypes.func.isRequired,
    onLongPressEnd: PropTypes.func.isRequired,
    showTeacherConfirm: PropTypes.bool.isRequired,
    onConfirmTeacher: PropTypes.func.isRequired,
    onCancelTeacherConfirm: PropTypes.func.isRequired,
};

StudentSpace.defaultProps = {
    activeStudent: null,
    startTs: null,
};
