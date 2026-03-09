/**
 * @file main.jsx — point d'entrée de l'application Fractions CE1.
 *
 * @description
 * Monte l'arbre React dans le nœud `#root` du document HTML.
 * `StrictMode` est activé pour détecter les effets de bord involontaires
 * et les usages dépréciés en développement.
 *
 * Le fichier `index.css` est importé ici pour garantir que les styles
 * globaux (Tailwind, animations, polices) sont chargés avant le premier rendu.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
