/**
 * @file TeacherSpace.jsx — orchestrateur de l'espace enseignant.
 *
 * @description
 * Route entre deux vues selon `teacherView` :
 * - `'home'`     → TeacherHome (gestion classe + liste ateliers)
 * - atelierID    → TeacherAtelierView (résultats + lancer session)
 *
 * Ne contient aucune logique métier — délègue tout aux vues enfants.
 *
 * @module teacher/TeacherSpace
 */

import PropTypes from "prop-types";
import TeacherHome from "./TeacherHome.jsx";
import TeacherAtelierView from "./TeacherAtelierView.jsx";

/**
 * @param {Object}      props
 * @param {string}      props.teacherView       - 'home' | atelierID
 * @param {Function}    props.setTeacherView    - Met à jour la vue
 * @param {Array}       props.students          - Liste des élèves
 * @param {Function}    props.addStudent        - Ajoute un élève
 * @param {Function}    props.removeStudent     - Supprime un élève
 * @param {Object}      props.traces            - Store de traces
 * @param {Function}    props.resetStudent      - Reset élève/atelier
 * @param {Function}    props.resetStudentAll   - Reset élève/tous ateliers
 * @param {Function}    props.resetAll          - Reset tout
 * @param {string|null} props.launchedAtelier   - Atelier en session
 * @param {Function}    props.onLaunchSession   - Lance une session
 * @param {Function}    props.onStopSession     - Arrête la session
 * @param {Function}    props.onExit            - Quitte l'espace enseignant
 */
export default function TeacherSpace({
    teacherView,
    setTeacherView,
    students,
    addStudent,
    removeStudent,
    traces,
    resetStudent,
    resetStudentAll,
    resetAll,
    launchedAtelier,
    onLaunchSession,
    onStopSession,
    onExit,
}) {
    if (teacherView !== "home") {
        return (
            <TeacherAtelierView
                atelierID={teacherView}
                students={students}
                traces={traces}
                launchedAtelier={launchedAtelier}
                resetStudent={resetStudent}
                resetStudentAll={resetStudentAll}
                resetAll={resetAll}
                onLaunchSession={onLaunchSession}
                onStopSession={onStopSession}
                onBack={() => setTeacherView("home")}
            />
        );
    }

    return (
        <TeacherHome
            students={students}
            addStudent={addStudent}
            removeStudent={removeStudent}
            traces={traces}
            launchedAtelier={launchedAtelier}
            onOpenAtelier={(id) => setTeacherView(id)}
            onExit={onExit}
        />
    );
}

TeacherSpace.propTypes = {
    teacherView: PropTypes.string.isRequired,
    setTeacherView: PropTypes.func.isRequired,
    students: PropTypes.array.isRequired,
    addStudent: PropTypes.func.isRequired,
    removeStudent: PropTypes.func.isRequired,
    traces: PropTypes.object.isRequired,
    resetStudent: PropTypes.func.isRequired,
    resetStudentAll: PropTypes.func.isRequired,
    resetAll: PropTypes.func.isRequired,
    launchedAtelier: PropTypes.string,
    onLaunchSession: PropTypes.func.isRequired,
    onStopSession: PropTypes.func.isRequired,
    onExit: PropTypes.func.isRequired,
};

TeacherSpace.defaultProps = {
    launchedAtelier: null,
};
