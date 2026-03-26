/**
 * @file HelpModal — modale d'aide à deux onglets.
 *
 * @description
 * Extrait de `Navbar.jsx` pour respecter le principe de responsabilité unique :
 * la barre de navigation ne devrait pas contenir ~80 lignes de contenu éditorial.
 *
 * ────────────────────────────────────────────────────────────────
 * Deux onglets
 * ────────────────────────────────────────────────────────────────
 * **Enseignant·e** :
 *   - Navigation et gestes (appui long, tableau de bord)
 *   - Objectif pédagogique de la séance (S6/6)
 *   - Les trois ateliers et leurs fractions couvertes
 *   - Lire le tableau de bord (code couleur des points)
 *
 * **Élève** :
 *   - Les quatre gestes : Ajouter / Valider / Nommer / Continuer
 *
 * ────────────────────────────────────────────────────────────────
 * Fermeture
 * ────────────────────────────────────────────────────────────────
 * Clic sur le fond semi-transparent ou sur le bouton "Fermer".
 *
 * @module HelpModal
 */

import { useState } from "react";
import PropTypes from "prop-types";

/**
 * Modale d'aide à deux onglets : enseignant·e et élève.
 *
 * @param {Object}   props
 * @param {Function} props.onClose - Ferme la modale
 * @returns {JSX.Element}
 */
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
                                            un secteur ou une réglette. Tu peux
                                            aussi en retirer avec le bouton ↩.
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
    /** Callback de fermeture — clic sur le fond ou sur "Fermer" */
    onClose: PropTypes.func.isRequired,
};
