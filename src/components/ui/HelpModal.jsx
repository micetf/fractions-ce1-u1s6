/**
 * @file HelpModal — modale d'aide à deux onglets.
 *
 * @description
 * Deux onglets :
 * - Enseignant·e : navigation, gestion des élèves, ateliers,
 *   tableau de bord, suivi de classe, sources théoriques et pédagogiques.
 * - Élève : les quatre gestes de manipulation.
 *
 * @module HelpModal
 */

import { useState } from "react";
import PropTypes from "prop-types";

// ─── Sous-composant : titre de section ─────────────────────────────────────────

function SectionTitle({ children }) {
    return (
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            {children}
        </h3>
    );
}
SectionTitle.propTypes = { children: PropTypes.node.isRequired };

// ─── Composant principal ────────────────────────────────────────────────────────

export default function HelpModal({ onClose }) {
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
                {/* ── En-tête ── */}
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

                {/* ── Contenu scrollable ── */}
                <div className="overflow-y-auto px-5 py-4 flex-1">
                    {/* ═══ ONGLET ENSEIGNANT·E ═══ */}
                    {tab === "teacher" && (
                        <div className="space-y-5 text-sm text-slate-700">
                            {/* Démarrage et navigation */}
                            <section>
                                <SectionTitle>
                                    Démarrage et navigation
                                </SectionTitle>
                                <ul className="space-y-2">
                                    <li>
                                        <strong>Lancer une session :</strong>{" "}
                                        depuis l&apos;écran d&apos;accueil,
                                        entrer dans l&apos;{" "}
                                        <strong>Espace enseignant·e</strong>,
                                        choisir un atelier puis cliquer sur{" "}
                                        <strong>Lancer la session</strong>. La
                                        tablette passe alors en mode élève.
                                    </li>
                                    <li>
                                        <strong>Accès direct :</strong> ajouter{" "}
                                        <code className="bg-slate-100 px-1 rounded text-xs">
                                            ?atelier=tg
                                        </code>
                                        ,{" "}
                                        <code className="bg-slate-100 px-1 rounded text-xs">
                                            ?atelier=dq
                                        </code>{" "}
                                        ou{" "}
                                        <code className="bg-slate-100 px-1 rounded text-xs">
                                            ?atelier=cu
                                        </code>{" "}
                                        à l&apos;URL pour ouvrir directement un
                                        atelier au chargement — idéal pour
                                        configurer les tablettes en avance.
                                    </li>
                                    <li>
                                        <strong>Menu enseignant·e :</strong>{" "}
                                        appui long (2 secondes) sur la zone
                                        centrale de la barre de navigation
                                        (titre + badge de l&apos;atelier).
                                        Accessible à tout moment pendant
                                        l&apos;activité.
                                    </li>
                                    <li>
                                        <strong>Tableau de bord élève :</strong>{" "}
                                        bouton <strong>📊</strong> en haut à
                                        droite — affiche la progression de
                                        l&apos;élève en cours, sans appui long.
                                    </li>
                                </ul>
                            </section>

                            {/* Gestion des élèves */}
                            <section>
                                <SectionTitle>Gestion des élèves</SectionTitle>
                                <ul className="space-y-2">
                                    <li>
                                        Ajouter les élèves via{" "}
                                        <strong>
                                            Espace enseignant·e → Ma classe
                                        </strong>
                                        . Un simple pseudo suffit (ex. :
                                        «&nbsp;Fred M&nbsp;»).
                                    </li>
                                    <li>
                                        En fin d&apos;atelier, l&apos;élève
                                        clique sur{" "}
                                        <strong>Passer la tablette →</strong>{" "}
                                        pour revenir à l&apos;écran de
                                        sélection. L&apos;enseignant·e peut
                                        aussi déclencher ce changement via{" "}
                                        <strong>
                                            Menu → Changer d&apos;élève
                                        </strong>
                                        .
                                    </li>
                                    <li>
                                        Les résultats sont conservés localement
                                        sur chaque tablette, par atelier.
                                    </li>
                                </ul>
                            </section>

                            {/* Les trois ateliers */}
                            <section>
                                <SectionTitle>Les trois ateliers</SectionTitle>
                                <div className="space-y-2">
                                    <div className="rounded-xl p-3 bg-blue-50 border border-blue-100">
                                        <p className="font-bold text-blue-800">
                                            🔷 Atelier 1 — Tangram
                                        </p>
                                        <p className="text-blue-600 text-xs mt-0.5">
                                            5 situations · Fractions du carré
                                        </p>
                                        <p className="mt-1 text-xs">
                                            Fractions : un demi (×2), un quart
                                            (×2), un huitième.
                                        </p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-purple-50 border border-purple-100">
                                        <p className="font-bold text-purple-800">
                                            ⭕ Atelier 2 — Disques
                                        </p>
                                        <p className="text-purple-600 text-xs mt-0.5">
                                            7 situations · Fractions du disque
                                        </p>
                                        <p className="mt-1 text-xs">
                                            Fractions : un demi, un tiers, un
                                            quart, un cinquième, un sixième, un
                                            huitième, un dixième.
                                        </p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-amber-50 border border-amber-100">
                                        <p className="font-bold text-amber-800">
                                            📏 Atelier 3 — Cuisenaire
                                        </p>
                                        <p className="text-amber-600 text-xs mt-0.5">
                                            6 situations · Fractions des
                                            réglettes
                                        </p>
                                        <p className="mt-1 text-xs">
                                            Fractions : un dixième, un
                                            cinquième, un demi, un tiers, un
                                            sixième, <em>deux cinquièmes</em>{" "}
                                            (situation non-unitaire — phase
                                            d&apos;explication guidée, pas de
                                            comptage).
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Lire le tableau de bord */}
                            <section>
                                <SectionTitle>
                                    Lire le tableau de bord
                                </SectionTitle>
                                <p className="mb-2">
                                    Accessible via le bouton <strong>📊</strong>{" "}
                                    (session en cours) ou le menu enseignant·e.
                                    Chaque situation terminée est représentée
                                    par un point coloré :
                                </p>
                                <ul className="space-y-1.5">
                                    {[
                                        {
                                            color: "bg-emerald-500",
                                            label: "Vert",
                                            desc: "réussi sans erreur (1er essai).",
                                        },
                                        {
                                            color: "bg-amber-400",
                                            label: "Ambre",
                                            desc: "réussi avec 1 ou 2 erreurs.",
                                        },
                                        {
                                            color: "bg-orange-400",
                                            label: "Orange",
                                            desc: "réussi avec 3 erreurs ou plus.",
                                        },
                                        {
                                            color: "bg-blue-500",
                                            label: "Bleu",
                                            desc: "situation en cours.",
                                        },
                                    ].map(({ color, label, desc }) => (
                                        <li
                                            key={label}
                                            className="flex items-center gap-2"
                                        >
                                            <span
                                                className={`w-3 h-3 rounded-full shrink-0 ${color}`}
                                            />
                                            <span>
                                                <strong>{label}</strong> —{" "}
                                                {desc}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-2">
                                    La section <em>Erreurs repérées</em> liste
                                    les distracteurs choisis lors des erreurs de
                                    nommage : ce sont les conceptions à
                                    exploiter lors de la mise en commun.
                                </p>
                            </section>

                            {/* Suivi de classe */}
                            <section>
                                <SectionTitle>
                                    Suivi de classe (après séance)
                                </SectionTitle>
                                <p>
                                    Depuis l&apos;{" "}
                                    <strong>Espace enseignant·e</strong>,
                                    cliquer sur un atelier pour voir la
                                    progression de toute la classe. Cliquer
                                    ensuite sur un élève affiche son bilan
                                    complet : prédiction, comptage, nommage,
                                    durée par situation et distracteurs choisis.
                                </p>
                            </section>

                            {/* Sources */}
                            <section>
                                <SectionTitle>
                                    Sources et références
                                </SectionTitle>
                                <div
                                    className="rounded-xl p-3 space-y-3 text-xs"
                                    style={{ background: "#F8F7F4" }}
                                >
                                    <p>
                                        <strong>Mission Maths 37</strong> — Cet
                                        outil propose une mise en œuvre
                                        numérique de la séance 6 de leur
                                        première séquence de découverte des
                                        fractions au CE1.{" "}
                                        <a
                                            href="https://digipad.app/p/1191415/9199dde61774f"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            Consulter la séquence →
                                        </a>
                                    </p>
                                    <p>
                                        <strong>Projet CAREC</strong> — Des
                                        éléments relatifs aux pratiques
                                        équitables et efficaces ont été intégrés
                                        dans la conception de l&apos;outil.
                                    </p>
                                    <p>
                                        <strong>Enseignement explicite</strong>{" "}
                                        — La structure de chaque situation
                                        (prédiction, manipulation, nommage,
                                        feedback procédural) s&apos;inspire des
                                        principes de l&apos;enseignement
                                        explicite.
                                    </p>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ═══ ONGLET ÉLÈVE ═══ */}
                    {tab === "student" && (
                        <div className="space-y-5 text-sm text-slate-700">
                            <section>
                                <SectionTitle>Les quatre gestes</SectionTitle>
                                <ol className="space-y-3">
                                    {[
                                        {
                                            icon: "🔮",
                                            title: "Anticiper",
                                            desc: "Combien de pièces faudra-t-il ? Donne ton estimation.",
                                        },
                                        {
                                            icon: "➕",
                                            title: "Ajouter",
                                            desc: 'Ajoute les pièces une à une, puis appuie sur le bouton de validation ("Le carré est rempli !", etc.).',
                                        },
                                        {
                                            icon: "🏷",
                                            title: "Nommer",
                                            desc: "Choisis le nom de la fraction parmi les quatre propositions. Tu as le droit de te tromper : un message t'aide à trouver.",
                                        },
                                        {
                                            icon: "▶",
                                            title: "Continuer",
                                            desc: 'Quand le message vert apparaît, appuie sur "Continuer →" pour passer à la suite.',
                                        },
                                    ].map(({ icon, title, desc }) => (
                                        <li
                                            key={title}
                                            className="flex gap-3 items-start"
                                        >
                                            <span className="text-2xl shrink-0">
                                                {icon}
                                            </span>
                                            <span>
                                                <strong>{title}</strong> —{" "}
                                                {desc}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            <section>
                                <SectionTitle>
                                    En fin d&apos;atelier
                                </SectionTitle>
                                <p>
                                    Appuie sur{" "}
                                    <strong>Passer la tablette →</strong> pour
                                    laisser la place au prochain élève, ou sur{" "}
                                    <strong>↺ Recommencer</strong> pour refaire
                                    l&apos;atelier.
                                </p>
                            </section>
                        </div>
                    )}
                </div>

                {/* ── Pied de modale ── */}
                <div className="px-5 py-4 border-t border-slate-100 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-slate-100
                                   hover:bg-slate-200 text-slate-700 font-bold
                                   text-sm transition-colors touch-manipulation"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

HelpModal.propTypes = {
    /** Ferme la modale */
    onClose: PropTypes.func.isRequired,
};
