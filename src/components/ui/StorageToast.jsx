/**
 * @file StorageToast — bandeau d'avertissement perte de données localStorage.
 *
 * @description
 * Affiché quand une écriture localStorage échoue (quota dépassé,
 * navigation privée, stockage désactivé par l'établissement).
 *
 * Positionnement : fixe, bas de l'écran, z-index au-dessus de tout.
 * Auto-disparition : 7 s après l'apparition (timer relancé à chaque
 * changement de `visible`).
 *
 * Pas de bibliothèque d'animation externe — classe CSS `.kf-up` existante.
 * Pas d'état interne : `visible` (prop) est la seule source de vérité.
 * Appeler `onDismiss` remet `visible` à false dans App — le composant
 * se démonte alors naturellement.
 *
 * @module StorageToast
 */

import { useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Bandeau d'avertissement stockage.
 *
 * @param {Object}   props
 * @param {boolean}  props.visible   - Contrôlé par App via storageError
 * @param {Function} props.onDismiss - Réinitialise storageError dans App
 */
export default function StorageToast({ visible, onDismiss }) {
    // Lance le minuteur d'auto-dismiss uniquement quand visible passe à true.
    // Pas de setState ici : c'est onDismiss() qui met visible à false dans App.
    useEffect(() => {
        if (!visible) return;
        const t = setTimeout(onDismiss, 7000);
        return () => clearTimeout(t);
    }, [visible, onDismiss]);

    if (!visible) return null;

    return (
        <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]
                       flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl
                       bg-amber-50 border border-amber-300 kf-up no-print"
            role="alert"
            aria-live="assertive"
        >
            <span className="text-xl shrink-0" aria-hidden="true">
                ⚠️
            </span>
            <p className="text-amber-900 text-sm font-bold leading-snug">
                Données non sauvegardées.{" "}
                <span className="font-semibold">
                    Vérifiez que le stockage du navigateur est autorisé.
                </span>
            </p>
            <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 text-amber-500 hover:text-amber-800
                           font-bold text-lg leading-none transition-colors
                           touch-manipulation"
                aria-label="Fermer l'avertissement"
            >
                ×
            </button>
        </div>
    );
}

StorageToast.propTypes = {
    /** Déclenche l'affichage — contrôlé par App.jsx */
    visible: PropTypes.bool.isRequired,
    /** Appelé à la disparition — réinitialise storageError dans App */
    onDismiss: PropTypes.func.isRequired,
};
