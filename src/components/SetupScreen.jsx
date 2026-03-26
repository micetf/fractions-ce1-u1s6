/**
 * @file SetupScreen.jsx — écran de préparation de la séance.
 *
 * @description
 * Premier écran affiché au lancement (pas d'atelier sélectionné).
 * Restructuré selon la piste C pour résoudre le problème de discoverability
 * de la gestion de classe.
 *
 * ────────────────────────────────────────────────────────────────
 * Structure visuelle
 * ────────────────────────────────────────────────────────────────
 *
 * ┌─ En-tête ─────────────────────────────────────────────────────┐
 * │  🧮 Fractions CE1                                             │
 * ├─ Section 1 : 👥 Ma classe ────────────────────────────────────┤
 * │  • État replié  : chips prénoms + bouton "Gérer"             │
 * │  • État déplié  : RosterManager inline + bouton "Fermer"     │
 * ├─ Section 2 : Choisir un atelier ──────────────────────────────┤
 * │  • AtelierCard × N                                           │
 * └───────────────────────────────────────────────────────────────┘
 *
 * @module SetupScreen
 */

import { useState } from "react";
import PropTypes from "prop-types";
import { ATELIERS_LIST } from "../data/ateliers.js";
import RosterManager from "./dashboard/RosterManager.jsx";

// ─── Sous-composant : carte atelier ────────────────────────────────────────────

/**
 * Carte cliquable représentant un atelier sélectionnable.
 *
 * @param {Object}   props
 * @param {Object}   props.choice   - Données de l'atelier (ATELIERS_LIST)
 * @param {Function} props.onSelect - Callback(id, total)
 * @returns {JSX.Element}
 */
function AtelierCard({ choice: c, onSelect }) {
    return (
        <button
            onClick={() => onSelect(c.id, c.total)}
            className="w-full rounded-3xl p-5 text-left shadow-md
                       hover:shadow-lg hover:-translate-y-0.5
                       active:scale-[.98] transition-all duration-150
                       touch-manipulation"
            style={{
                background: c.light,
                border: `2.5px solid ${c.color}22`,
            }}
        >
            <div className="flex items-center gap-4">
                <span className="text-4xl" role="img" aria-hidden="true">
                    {c.icon}
                </span>
                <div className="flex-1 min-w-0">
                    <p
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: c.color }}
                    >
                        {c.num} · {c.total} situation{c.total > 1 ? "s" : ""}
                    </p>
                    <p
                        className="text-xl font-bold text-slate-800 truncate"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                        {c.sub}
                    </p>
                    <p className="text-sm text-slate-500 font-semibold mt-0.5">
                        {c.desc}
                    </p>
                </div>
                <span className="text-slate-300 font-bold text-lg flex-shrink-0">
                    ›
                </span>
            </div>
        </button>
    );
}

AtelierCard.propTypes = {
    choice: PropTypes.shape({
        id: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        num: PropTypes.string.isRequired,
        sub: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
};

// ─── Sous-composant : panneau classe ───────────────────────────────────────────

/**
 * Panneau accordéon « Ma classe » affiché en haut de SetupScreen.
 *
 * - **Replié** : aperçu des prénoms sous forme de chips + bouton « Gérer les élèves ».
 * - **Déplié** : RosterManager complet (ajout / suppression).
 *
 * L'enseignant·e peut configurer sa classe sans quitter l'écran d'accueil,
 * avant même de choisir un atelier.
 *
 * @param {Object}   props
 * @param {Array}    props.students      - Liste des élèves (useRoster)
 * @param {Function} props.addStudent    - Ajoute un élève → err|null
 * @param {Function} props.removeStudent - Supprime un élève par id
 * @param {Object}   props.traces        - Store de traces (pour ConfirmModal dans RosterManager)
 * @returns {JSX.Element}
 */
function ClassPanel({ students, addStudent, removeStudent, traces }) {
    const [open, setOpen] = useState(false);

    const count = students.length;

    return (
        <div
            className="w-full bg-white rounded-3xl shadow-md overflow-hidden"
            style={{ maxWidth: "400px" }}
        >
            {/* ── En-tête du panneau — toujours visible ── */}
            <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg" aria-hidden="true">
                        👥
                    </span>
                    <span
                        className="font-bold text-slate-800"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                        Ma classe
                    </span>
                    {/* Compteur élèves */}
                    <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full
                                     bg-slate-100 text-slate-500"
                    >
                        {count} élève{count !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Bouton toggle */}
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                               text-sm font-bold transition-colors touch-manipulation
                               bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
                    aria-expanded={open}
                >
                    {open ? (
                        <>
                            Fermer <span aria-hidden="true">▲</span>
                        </>
                    ) : (
                        <>
                            Gérer <span aria-hidden="true">▼</span>
                        </>
                    )}
                </button>
            </div>

            {/* ── Vue repliée : chips prénoms ── */}
            {!open && (
                <div className="px-5 pb-4">
                    {count === 0 ? (
                        /* Invite à configurer */
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="w-full flex items-center justify-center gap-2
                                       py-3 rounded-2xl border-2 border-dashed border-slate-200
                                       text-slate-400 font-semibold text-sm
                                       hover:border-blue-300 hover:text-blue-500
                                       transition-colors touch-manipulation"
                        >
                            <span>＋</span>
                            <span>Ajouter des élèves avant de commencer</span>
                        </button>
                    ) : (
                        /* Chips des prénoms */
                        <div className="flex flex-wrap gap-2">
                            {students.map((s) => (
                                <span
                                    key={s.id}
                                    className="px-3 py-1 rounded-full text-sm font-bold
                                               bg-slate-100 text-slate-700"
                                >
                                    {s.pseudo}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Vue dépliée : RosterManager complet ── */}
            {open && (
                <div className="px-5 pb-4 border-t border-slate-100">
                    <div className="pt-3">
                        <RosterManager
                            students={students}
                            addStudent={addStudent}
                            removeStudent={removeStudent}
                            traces={traces}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

ClassPanel.propTypes = {
    students: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            pseudo: PropTypes.string.isRequired,
        })
    ).isRequired,
    addStudent: PropTypes.func.isRequired,
    removeStudent: PropTypes.func.isRequired,
    traces: PropTypes.object.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Écran de préparation de la séance.
 *
 * @param {Object}   props
 * @param {Array}    props.students      - Liste des élèves (useRoster)
 * @param {Function} props.addStudent    - Ajoute un élève
 * @param {Function} props.removeStudent - Supprime un élève
 * @param {Object}   props.traces        - Store de traces
 * @param {Function} props.onSelect      - Callback(id, total) → lance l'atelier
 * @returns {JSX.Element}
 */
export default function SetupScreen({
    students,
    addStudent,
    removeStudent,
    traces,
    onSelect,
}) {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center
                       p-6 gap-6"
            style={{ background: "#F1EDE4" }}
        >
            {/* ── En-tête ── */}
            <div className="text-center">
                <h1
                    className="text-4xl font-bold text-slate-800 mb-1"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    🧮 Fractions CE1
                </h1>
                <p className="text-slate-500 font-semibold text-sm">
                    Séquence fractions CE1 · CAREC Grenoble · A. Tricot
                </p>
            </div>

            {/* ── Section 1 : Ma classe ── */}
            <ClassPanel
                students={students}
                addStudent={addStudent}
                removeStudent={removeStudent}
                traces={traces}
            />

            {/* ── Séparateur ── */}
            <div
                className="flex items-center gap-3 w-full"
                style={{ maxWidth: "400px" }}
            >
                <div className="flex-1 h-px bg-slate-300/60" />
                <p className="text-slate-500 font-bold text-sm shrink-0">
                    Choisir un atelier
                </p>
                <div className="flex-1 h-px bg-slate-300/60" />
            </div>

            {/* ── Section 2 : Ateliers ── */}
            <div
                className="flex flex-col gap-4 w-full"
                style={{ maxWidth: "400px" }}
            >
                {ATELIERS_LIST.map((c) => (
                    <AtelierCard key={c.id} choice={c} onSelect={onSelect} />
                ))}
            </div>
        </div>
    );
}

SetupScreen.propTypes = {
    students: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            pseudo: PropTypes.string.isRequired,
        })
    ).isRequired,
    addStudent: PropTypes.func.isRequired,
    removeStudent: PropTypes.func.isRequired,
    traces: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
};
