/**
 * @file Navbar — barre de navigation MiCetF, contextuelle selon la vue active.
 *
 * @description
 * Barre fixe `h-14` (56 px), `z-50`, remplaçant l'ancien `<header>` dédié
 * aux ateliers. Elle est la **seule** barre présente dans toute l'application.
 *
 * ────────────────────────────────────────────────────────────────
 * Deux modes
 * ────────────────────────────────────────────────────────────────
 * **Mode sélection** (props atelier absentes) :
 *   Gauche : lien MiCetF  |  Centre : titre fixe  |  Droite : actions
 *
 * **Mode atelier** (props atelier présentes) :
 *   Gauche : lien MiCetF  |  Centre : zone d'appui long (titre + badge)
 *   Droite : bouton 📊 + actions
 *
 * ────────────────────────────────────────────────────────────────
 * Appui long
 * ────────────────────────────────────────────────────────────────
 * En mode atelier, la zone centrale (🧮 Fractions CE1 · badge) déclenche
 * le TeacherMenu après 2 s via onLongPressStart / onLongPressEnd.
 * Ce geste discret est documenté dans la modale d'aide.
 *
 * ────────────────────────────────────────────────────────────────
 * Modale d'aide — deux onglets
 * ────────────────────────────────────────────────────────────────
 * Onglet Enseignant·e :
 *   - Navigation et gestes (fonctionnel)
 *   - Objectif pédagogique de la séance
 *   - Les trois ateliers et leurs fractions
 *   - Lire le tableau de bord
 *   - Situation non-unitaire (Cuisenaire)
 *
 * Onglet Élève :
 *   - Les trois gestes (ajouter / valider / nommer / continuer)
 *
 * @module Navbar
 */

import { useState } from "react";
import PropTypes from "prop-types";

// ─── HelpModal ──────────────────────────────────────────────────────────────────

/**
 * Modale d'aide à deux onglets : enseignant·e et élève.
 * Fermée par clic sur le fond ou sur "Fermer".
 *
 * @param {Object}   props
 * @param {Function} props.onClose - Ferme la modale
 * @returns {JSX.Element}
 */
function HelpModal({ onClose }) {
    const [tab, setTab] = useState("teacher");

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,.65)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
                style={{ maxHeight: "90vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* En-tête */}
                <div className="px-5 pt-5 pb-0 shrink-0">
                    <h2
                        className="font-bold text-slate-800 text-xl mb-4"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                        🧮 Fractions CE1 — Aide
                    </h2>
                    <div className="flex border-b border-slate-200">
                        <button
                            type="button"
                            onClick={() => setTab("teacher")}
                            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 -mb-px
                ${
                    tab === "teacher"
                        ? "border-blue-600 text-blue-700"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                        >
                            👩‍🏫 Enseignant·e
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("student")}
                            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 -mb-px
                ${
                    tab === "student"
                        ? "border-emerald-600 text-emerald-700"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                        >
                            🧒 Élève
                        </button>
                    </div>
                </div>

                {/* Contenu scrollable */}
                <div className="overflow-y-auto px-5 py-4 flex-1">
                    {/* ═══ ONGLET ENSEIGNANT·E ═══ */}
                    {tab === "teacher" && (
                        <div className="space-y-5 text-sm text-slate-700">
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Navigation et gestes
                                </h3>
                                <ul className="space-y-2">
                                    <li>
                                        <strong>Choisir un atelier :</strong>{" "}
                                        sélectionner l'atelier depuis l'écran
                                        d'accueil avant de passer la tablette à
                                        l'élève.
                                    </li>
                                    <li>
                                        <strong>Menu enseignant·e :</strong>{" "}
                                        appui long (2 secondes) sur la zone
                                        centrale de cette barre (titre + badge
                                        de l'atelier) pendant l'activité. Permet
                                        d'ouvrir le tableau de bord ou de
                                        changer d'atelier.
                                    </li>
                                    <li>
                                        <strong>Tableau de bord :</strong>{" "}
                                        accessible également via le bouton{" "}
                                        <strong>📊</strong> en haut à droite,
                                        sans appui long.
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Objectif de la séance (S6/6)
                                </h3>
                                <p>
                                    Nommer des fractions unité à partir d'une
                                    manipulation physique. Chaque situation suit
                                    le même enchaînement :
                                </p>
                                <ol className="mt-2 space-y-1 list-decimal list-inside">
                                    <li>
                                        <strong>Comptage</strong> — combien de
                                        parts égales faut-il pour reconstituer
                                        le tout ?
                                    </li>
                                    <li>
                                        <strong>Nommage</strong> — quel est le
                                        nom de cette fraction parmi quatre
                                        propositions ?
                                    </li>
                                </ol>
                                <p className="mt-2 text-slate-500 italic">
                                    Les messages de feedback ne donnent jamais
                                    la réponse : ils rappellent la procédure
                                    (combien ?) ou la règle de nommage (quand il
                                    faut N parts égales, on dit…). Modèle : A.
                                    Tricot, enseignement explicite — CAREC
                                    Grenoble.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Les trois ateliers
                                </h3>
                                <div className="space-y-2">
                                    <div className="rounded-xl p-3 bg-blue-50 border border-blue-100">
                                        <p className="font-bold text-blue-800">
                                            🔷 Atelier 1 — Tangram
                                        </p>
                                        <p className="text-blue-700 text-xs mt-0.5">
                                            5 situations · Fractions du carré
                                        </p>
                                        <p className="mt-1">
                                            Fractions couvertes : un demi (×2),
                                            un quart (×2), un huitième.
                                        </p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-purple-50 border border-purple-100">
                                        <p className="font-bold text-purple-800">
                                            ⭕ Atelier 2 — Disques
                                        </p>
                                        <p className="text-purple-700 text-xs mt-0.5">
                                            7 situations · Fractions du disque
                                        </p>
                                        <p className="mt-1">
                                            Fractions couvertes : un demi, un
                                            tiers, un quart, un cinquième, un
                                            sixième, un huitième, un dixième.
                                        </p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-amber-50 border border-amber-100">
                                        <p className="font-bold text-amber-800">
                                            📏 Atelier 3 — Cuisenaire
                                        </p>
                                        <p className="text-amber-700 text-xs mt-0.5">
                                            6 situations · Fractions des
                                            réglettes
                                        </p>
                                        <p className="mt-1">
                                            Fractions couvertes : un dixième, un
                                            cinquième, un demi, un tiers, un
                                            sixième, deux cinquièmes.
                                        </p>
                                        <p className="mt-1 text-amber-800">
                                            <strong>
                                                Situation non-unitaire
                                            </strong>{" "}
                                            (réglette violette = deux
                                            cinquièmes) : pas de phase de
                                            comptage. Une décomposition visuelle
                                            est affichée à l'écran ;
                                            l'enseignant·e commente le
                                            raisonnement avant que l'élève nomme
                                            la fraction.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Lire le tableau de bord
                                </h3>
                                <p className="mb-2">
                                    Chaque situation terminée est représentée
                                    par un point coloré dans la frise :
                                </p>
                                <ul className="space-y-1.5">
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                                        <span>
                                            <strong>Vert</strong> — réussi sans
                                            aucune erreur (comptage et nommage
                                            du premier coup).
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                                        <span>
                                            <strong>Ambre</strong> — réussi avec
                                            1 ou 2 erreurs au total.
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-orange-400 shrink-0" />
                                        <span>
                                            <strong>Orange</strong> — réussi
                                            avec 3 erreurs ou plus.
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                                        <span>
                                            <strong>Bleu</strong> — situation en
                                            cours.
                                        </span>
                                    </li>
                                </ul>
                                <p className="mt-2">
                                    La section <em>Erreurs repérées</em> liste
                                    les distracteurs choisis lors des erreurs de
                                    nommage : ce sont les conceptions à
                                    exploiter lors de la mise en commun.
                                </p>
                                <p className="mt-1">
                                    Le bouton <strong>🖨 Imprimer</strong>{" "}
                                    produit une version imprimable du tableau de
                                    bord (les éléments de navigation
                                    disparaissent à l'impression).
                                </p>
                            </section>
                        </div>
                    )}

                    {/* ═══ ONGLET ÉLÈVE ═══ */}
                    {tab === "student" && (
                        <div className="space-y-4 text-sm text-slate-700">
                            <p className="text-slate-500 italic">
                                À lire avec l'élève lors du premier passage, ou
                                à projeter au tableau.
                            </p>
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    Comment ça marche ?
                                </h3>
                                <ol className="space-y-4 list-none">
                                    <li className="flex gap-3 items-start">
                                        <span className="text-2xl shrink-0">
                                            ➕
                                        </span>
                                        <span>
                                            <strong>Ajouter</strong> — appuie
                                            sur le bouton pour poser une pièce,
                                            un sectee part ou une réglette. Tu
                                            peux aussi en retirer avec le bouton
                                            ↩.
                                        </span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="text-2xl shrink-0">
                                            ✓
                                        </span>
                                        <span>
                                            <strong>Valider</strong> — quand le
                                            tout est bien rempli, appuie sur le
                                            bouton de validation. L'application
                                            te dira si c'est correct.
                                        </span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="text-2xl shrink-0">
                                            🔤
                                        </span>
                                        <span>
                                            <strong>Nommer</strong> — choisis
                                            parmi les quatre mots celui qui
                                            correspond à la fraction. Tu as le
                                            droit de te tromper : un message
                                            t'aide à trouver.
                                        </span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="text-2xl shrink-0">
                                            ▶
                                        </span>
                                        <span>
                                            <strong>Continuer</strong> — quand
                                            le message vert apparaît, appuie sur
                                            "Continuer →" pour passer à la
                                            situation suivante.
                                        </span>
                                    </li>
                                </ol>
                            </section>
                        </div>
                    )}
                </div>

                {/* Pied de modale */}
                <div className="px-5 pb-5 pt-3 shrink-0 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-slate-800 text-white
                       font-bold text-sm hover:bg-slate-700 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

HelpModal.propTypes = {
    onClose: PropTypes.func.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Barre de navigation MiCetF — fixe, z-50, h-14 (56 px).
 *
 * @param {Object|null}   [props.atelierMeta]       - Métadonnées de l'atelier actif (null = SetupScreen)
 * @param {string}        props.atelierMeta.icon    - Emoji de l'atelier
 * @param {string}        props.atelierMeta.label   - Nom de l'atelier
 * @param {string}        props.atelierMeta.color   - Couleur thématique (hex)
 * @param {string}        props.atelierMeta.light   - Couleur de fond claire (hex)
 * @param {string}        props.atelierMeta.border  - Couleur de bordure (hex)
 * @param {string}        props.atelierMeta.sub     - Sous-titre de l'atelier
 * @param {Function|null} [props.onLongPressStart]  - Début d'appui long
 * @param {Function|null} [props.onLongPressEnd]    - Fin / annulation d'appui long
 * @param {Function|null} [props.onOpenDash]        - Ouvre le Dashboard
 * @param {boolean}       [props.hasSitDone]        - Point vert sur 📊
 *
 * @returns {JSX.Element}
 */
export default function Navbar({
    atelierMeta = null,
    onLongPressStart = null,
    onLongPressEnd = null,
    onOpenDash = null,
    hasSitDone = false,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    const isAtelier = atelierMeta !== null;

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50 no-print"
                aria-label="Barre de navigation principale"
            >
                <div className="max-w-full px-4">
                    <div className="flex items-center justify-between h-14">
                        {/* Lien MiCetF */}
                        <a
                            href="https://micetf.fr"
                            className="text-white font-semibold text-lg hover:text-gray-300 transition shrink-0"
                        >
                            MiCetF
                        </a>

                        {/* Burger mobile */}
                        <button
                            type="button"
                            className="md:hidden inline-flex items-center justify-center p-2
                         text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
                            aria-controls="navbarMenu"
                            aria-expanded={menuOpen}
                            aria-label="Ouvrir le menu"
                            onClick={() => setMenuOpen((o) => !o)}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        {/* Barre desktop */}
                        <div
                            id="navbarMenu"
                            className={`${menuOpen ? "flex" : "hidden"} md:flex md:items-center md:flex-1
                          flex-col md:flex-row absolute md:static top-14 left-0 right-0
                          bg-gray-800 md:bg-transparent px-4 md:px-0 pb-3 md:pb-0`}
                        >
                            {/* Centre */}
                            <div className="flex items-center ml-0 md:ml-4 py-2 md:py-0">
                                {isAtelier ? (
                                    <div
                                        className="flex items-center gap-2 cursor-pointer select-none
                               rounded-xl px-2 py-1 hover:bg-white/10 transition-colors"
                                        style={{
                                            WebkitTapHighlightColor:
                                                "transparent",
                                        }}
                                        onPointerDown={onLongPressStart}
                                        onPointerUp={onLongPressEnd}
                                        onPointerLeave={onLongPressEnd}
                                        title="Appui long : menu enseignant·e"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            className="h-4 w-4 shrink-0"
                                            fill="#f8f9fa"
                                        >
                                            <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
                                        </svg>
                                        <span
                                            className="text-white font-semibold text-base"
                                            style={{
                                                fontFamily:
                                                    "'Fredoka', sans-serif",
                                            }}
                                        >
                                            Fractions CE1
                                        </span>
                                        <span className="text-gray-500 mx-1 hidden sm:inline">
                                            ·
                                        </span>
                                        <span
                                            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5
                                 rounded-lg text-xs font-bold"
                                            style={{
                                                background: atelierMeta.light,
                                                border: `1.5px solid ${atelierMeta.border}`,
                                                color: atelierMeta.color,
                                            }}
                                        >
                                            <span>{atelierMeta.icon}</span>
                                            <span>{atelierMeta.label}</span>
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            className="h-4 w-4 shrink-0"
                                            fill="#f8f9fa"
                                        >
                                            <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
                                        </svg>
                                        <span
                                            className="text-white font-semibold text-lg"
                                            style={{
                                                fontFamily:
                                                    "'Fredoka', sans-serif",
                                            }}
                                        >
                                            Fractions CE1
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1" />

                            {/* Actions droite */}
                            <ul className="flex items-center space-x-1 mt-2 md:mt-0">
                                {/* Bouton 📊 — mode atelier uniquement */}
                                {isAtelier && (
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onOpenDash?.();
                                                setMenuOpen(false);
                                            }}
                                            aria-label="Ouvrir le tableau de bord"
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white
                                 text-xs font-bold transition-colors hover:bg-white/20"
                                            style={{
                                                background:
                                                    "rgba(255,255,255,.12)",
                                                border: "1px solid rgba(255,255,255,.2)",
                                            }}
                                        >
                                            <span>📊</span>
                                            <span className="hidden sm:inline">
                                                Tableau de bord
                                            </span>
                                            {hasSitDone && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0" />
                                            )}
                                        </button>
                                    </li>
                                )}

                                {/* Aide */}
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHelpOpen(true);
                                            setMenuOpen(false);
                                        }}
                                        className="w-10 h-10 bg-blue-600 text-white rounded-full
                               hover:bg-blue-700 transition font-bold text-lg"
                                        title="Aide"
                                    >
                                        ?
                                    </button>
                                </li>

                                {/* Don PayPal */}
                                <li>
                                    <form
                                        action="https://www.paypal.com/cgi-bin/webscr"
                                        method="post"
                                        target="_top"
                                        className="inline-block"
                                    >
                                        <button
                                            type="submit"
                                            className="px-3 py-2 bg-yellow-500 text-white rounded
                                 hover:bg-yellow-600 transition my-1 mx-1"
                                            title="Si vous pensez que ces outils le méritent... Merci !"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                className="h-4 w-4 inline"
                                                fill="#f8f9fa"
                                            >
                                                <path d="M10 3.22l-.61-.6a5.5 5.5 0 00-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 00-7.78-7.77l-.61.61z" />
                                            </svg>
                                        </button>
                                        <input
                                            type="hidden"
                                            name="cmd"
                                            value="_s-xclick"
                                        />
                                        <input
                                            type="hidden"
                                            name="hosted_button_id"
                                            value="Q2XYVFP4EEX2J"
                                        />
                                    </form>
                                </li>

                                {/* Contact */}
                                <li>
                                    <a
                                        href="mailto:webmaster@micetf.fr?subject=À propos de /fractions-ce1-u1s6"
                                        className="px-3 py-2 bg-gray-600 text-white rounded
                               hover:bg-gray-700 transition my-1 mx-1 inline-block"
                                        title="Pour contacter le webmaster..."
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            className="h-4 w-4 inline"
                                            fill="#f8f9fa"
                                        >
                                            <path d="M18 2a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V4c0-1.1.9-2 2-2h16zm-4.37 9.1L20 16v-2l-5.12-3.9L20 6V4l-10 8L0 4v2l5.12 4.1L0 14v2l6.37-4.9L10 14l3.63-2.9z" />
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
        </>
    );
}

Navbar.propTypes = {
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        border: PropTypes.string.isRequired,
        sub: PropTypes.string.isRequired,
    }),
    onLongPressStart: PropTypes.func,
    onLongPressEnd: PropTypes.func,
    onOpenDash: PropTypes.func,
    hasSitDone: PropTypes.bool,
};
