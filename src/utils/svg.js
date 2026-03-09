/**
 * @file Fonctions utilitaires pour le rendu SVG des formes géométriques.
 * Fonctions pures sans état ni effets de bord.
 */

/**
 * Calcule les coordonnées cartésiennes d'un point situé sur un cercle,
 * à partir de coordonnées polaires. L'angle 0° correspond au sommet (haut).
 *
 * @param {number} cx  - Coordonnée x du centre du cercle
 * @param {number} cy  - Coordonnée y du centre du cercle
 * @param {number} r   - Rayon du cercle
 * @param {number} deg - Angle en degrés (sens horaire, 0° = haut)
 * @returns {{ x: number, y: number }} Coordonnées cartésiennes du point
 *
 * @example
 * polar(100, 100, 85, 0)   // => { x: 100, y: 15 }   (sommet)
 * polar(100, 100, 85, 180) // => { x: 100, y: 185 }  (bas)
 */
export function polar(cx, cy, r, deg) {
    const a = ((deg - 90) * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(a),
        y: cy + r * Math.sin(a),
    };
}

/**
 * Génère la valeur de l'attribut `d` d'un chemin SVG représentant
 * un secteur angulaire (part de camembert).
 *
 * La commande produit : centre → arc → retour centre (zone fermée).
 *
 * @param {number} cx - Coordonnée x du centre
 * @param {number} cy - Coordonnée y du centre
 * @param {number} r  - Rayon du secteur
 * @param {number} a1 - Angle de départ en degrés
 * @param {number} a2 - Angle de fin en degrés
 * @returns {string} Chaîne SVG path `d`
 *
 * @example
 * arc(100, 100, 85, 0, 90)  // secteur d'un quart de disque
 */
export function arc(cx, cy, r, a1, a2) {
    const s = polar(cx, cy, r, a1);
    const e = polar(cx, cy, r, a2);
    const lg = a2 - a1 > 180 ? 1 : 0;
    return (
        `M${cx},${cy}` +
        `L${s.x.toFixed(1)},${s.y.toFixed(1)}` +
        `A${r},${r},0,${lg},1,${e.x.toFixed(1)},${e.y.toFixed(1)}Z`
    );
}
