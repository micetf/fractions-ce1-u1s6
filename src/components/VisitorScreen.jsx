/**
 * @file VisitorScreen.jsx — écran d'accueil visiteur.
 *
 * @description
 * Premier écran vu par quiconque ouvre l'URL.
 * Rend la Navbar en mode 'visitor' (PayPal + email visibles).
 *
 * @module VisitorScreen
 */

import { useState } from "react";
import PropTypes from "prop-types";
import Navbar from "./Navbar.jsx";
import TeacherConfirmOverlay from "./ui/TeacherConfirmOverlay.jsx";

/**
 * @param {Object}      props
 * @param {string|null} props.launchedAtelier - ID de l'atelier en session
 * @param {Object|null} props.atelierMeta     - Métadonnées de l'atelier en session
 * @param {Array}       props.students        - Liste des élèves
 * @param {Function}    props.onEnterTeacher  - Bascule en mode enseignant
 * @param {Function}    props.onEnterStudent  - Bascule en mode élève
 */
export default function VisitorScreen({
    launchedAtelier,
    atelierMeta,
    students,
    onEnterTeacher,
    onEnterStudent,
}) {
    const [showConfirm, setShowConfirm] = useState(false);

    const sessionActive = launchedAtelier !== null;
    const canJoinSession = sessionActive && students.length > 0;

    return (
        <>
            {/* ── Navbar mode visiteur ── */}
            <Navbar mode="visitor" />

            <div
                className="min-h-screen pt-14 flex flex-col items-center
                           justify-center gap-8 p-6"
                style={{ background: "#F1EDE4" }}
            >
                {/* ── Titre ── */}
                <div className="text-center">
                    <h1
                        className="text-4xl font-bold text-slate-800 mb-1"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                        🧮 Fractions CE1
                    </h1>
                    <p className="text-slate-400 font-semibold text-sm">
                        Séquence CAREC Grenoble · A.&nbsp;Tricot
                    </p>
                </div>

                {/* ── Badge session active ── */}
                {sessionActive && atelierMeta && (
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2
                                   rounded-full text-sm font-bold"
                        style={{
                            background: atelierMeta.light,
                            border: `2px solid ${atelierMeta.border}`,
                            color: atelierMeta.color,
                        }}
                    >
                        <span
                            className="relative flex h-2 w-2"
                            aria-hidden="true"
                        >
                            <span
                                className="animate-ping absolute inline-flex h-full
                                           w-full rounded-full opacity-75"
                                style={{ background: atelierMeta.color }}
                            />
                            <span
                                className="relative inline-flex rounded-full h-2 w-2"
                                style={{ background: atelierMeta.color }}
                            />
                        </span>
                        Session active · {atelierMeta.icon} {atelierMeta.label}
                    </div>
                )}

                {/* ── Boutons ── */}
                <div
                    className="flex flex-col gap-4 w-full"
                    style={{ maxWidth: "360px" }}
                >
                    {/* Chemin élève */}
                    {canJoinSession ? (
                        <button
                            type="button"
                            onClick={onEnterStudent}
                            className="w-full py-5 rounded-3xl text-white font-bold
                                       text-xl shadow-lg active:scale-[.98]
                                       transition-all touch-manipulation"
                            style={{ background: atelierMeta.color }}
                        >
                            👤 Je suis élève
                        </button>
                    ) : (
                        <div
                            className="w-full py-5 rounded-3xl text-center
                                        border-2 border-dashed border-slate-300"
                        >
                            <p className="text-slate-400 font-bold text-base">
                                {sessionActive
                                    ? "⏳ Aucun élève configuré"
                                    : "⏳ En attente d'une session"}
                            </p>
                            <p className="text-slate-400 text-sm font-semibold mt-1">
                                {sessionActive
                                    ? "Demande à ton enseignant·e d'ajouter les élèves"
                                    : "L'enseignant·e doit d'abord lancer une session"}
                            </p>
                        </div>
                    )}

                    {/* Séparateur */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-300/60" />
                        <span className="text-slate-400 text-xs font-bold">
                            ou
                        </span>
                        <div className="flex-1 h-px bg-slate-300/60" />
                    </div>

                    {/* Chemin enseignant */}
                    <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        className="w-full py-3 rounded-2xl text-slate-600 font-bold
                                   text-sm border border-slate-200 bg-white
                                   hover:bg-slate-50 shadow-sm transition-colors
                                   touch-manipulation"
                    >
                        🎓 Espace enseignant·e
                    </button>
                </div>
            </div>

            {showConfirm && (
                <TeacherConfirmOverlay
                    onConfirm={() => {
                        setShowConfirm(false);
                        onEnterTeacher();
                    }}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </>
    );
}

VisitorScreen.propTypes = {
    launchedAtelier: PropTypes.string,
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        border: PropTypes.string.isRequired,
    }),
    students: PropTypes.array.isRequired,
    onEnterTeacher: PropTypes.func.isRequired,
    onEnterStudent: PropTypes.func.isRequired,
};

VisitorScreen.defaultProps = {
    launchedAtelier: null,
    atelierMeta: null,
};
