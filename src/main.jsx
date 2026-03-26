/**
 * @file main.jsx — point d'entrée de l'application Fractions CE1.
 *
 * @description
 * Monte l'arbre React dans le nœud `#root` du document HTML.
 * `StrictMode` est activé pour détecter les effets de bord involontaires
 * et les usages dépréciés en développement.
 *
 * Les polices Fredoka et Nunito sont importées depuis @fontsource
 * (auto-hébergées, conformes RGPD — aucune requête vers les serveurs Google).
 * Seules les graisses effectivement utilisées sont importées pour limiter
 * le volume de fichiers embarqués dans le build.
 *
 * Fredoka  : 500 (titres courants), 700 (titres forts)
 * Nunito   : 400 (corps), 600 (semi-bold), 700 (bold), 800 (extra-bold)
 */

// ── Polices auto-hébergées ────────────────────────────────────────────────────
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";

// ── Application ───────────────────────────────────────────────────────────────
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
