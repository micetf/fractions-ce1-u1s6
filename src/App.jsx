import { useState, useRef } from "react";
import { useEventLog } from "./hooks/useEventLog.js";
import SetupScreen from "./components/SetupScreen.jsx";
import TeacherMenu from "./components/TeacherMenu.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import AtelierTangram from "./components/ateliers/AtelierTangram.jsx";
import AtelierDisques from "./components/ateliers/AtelierDisques.jsx";
import AtelierCuisenaire from "./components/ateliers/AtelierCuisenaire.jsx";
import { TG } from "./data/tangram.js";
import { DQ } from "./data/disques.js";
import { CUI } from "./data/cuisenaire.js";

/** @type {Object.<string, { icon: string, label: string, color: string, light: string, border: string, sub: string }>} */
const META = {
    tg: {
        icon: "🔷",
        label: "Tangram",
        color: "#2563EB",
        light: "#EFF6FF",
        border: "#BFDBFE",
        sub: "Fractions du carré",
    },
    dq: {
        icon: "⭕",
        label: "Disques",
        color: "#7C3AED",
        light: "#F5F3FF",
        border: "#DDD6FE",
        sub: "Fractions du disque",
    },
    cu: {
        icon: "📏",
        label: "Cuisenaire",
        color: "#B45309",
        light: "#FFFBEB",
        border: "#FDE68A",
        sub: "Fractions des réglettes",
    },
};

export default function App() {
    const [atelier, setAtelier] = useState(null);
    const [totalSits, setTotalSits] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const [showDash, setShowDash] = useState(false);
    const { events, log, resetLog } = useEventLog();
    const [startTs, setStartTs] = useState(null);
    const holdRef = useRef(null);

    const selectAtelier = (id, total) => {
        resetLog();
        setAtelier(id);
        setTotalSits(total);
        setStartTs(Date.now());
    };

    const startHold = () => {
        holdRef.current = setTimeout(() => setShowMenu(true), 2000);
    };
    const endHold = () => clearTimeout(holdRef.current);

    if (!atelier) return <SetupScreen onSelect={selectAtelier} />;

    const m = META[atelier];

    return (
        <div className="min-h-screen" style={{ background: "#F1EDE4" }}>
            <header
                className="sticky top-0 z-10 no-print"
                style={{ background: "#1E3A5F" }}
            >
                <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ maxWidth: "680px", margin: "0 auto" }}
                >
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        onPointerDown={startHold}
                        onPointerUp={endHold}
                        onPointerLeave={endHold}
                    >
                        <span className="text-xl">🧮</span>
                        <span
                            className="text-base font-bold text-white"
                            style={{ fontFamily: "'Fredoka',sans-serif" }}
                        >
                            Fractions CE1
                        </span>
                    </div>
                    <button
                        onClick={() => setShowDash(true)}
                        className="flex items-center gap-2 py-2 px-3 rounded-xl font-bold text-xs text-white"
                        style={{
                            background: "rgba(255,255,255,.15)",
                            border: "1px solid rgba(255,255,255,.25)",
                        }}
                    >
                        <span>📊</span>
                        <span className="hidden sm:inline">
                            Tableau de bord
                        </span>
                        {events.some((e) => e.type === "SIT_DONE") && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        )}
                    </button>
                </div>
                <div
                    className="px-4 pb-2.5"
                    style={{ maxWidth: "680px", margin: "0 auto" }}
                >
                    <div
                        className="inline-flex items-center gap-2 py-2 px-4 rounded-2xl cursor-pointer"
                        style={{
                            background: m.light,
                            border: `2px solid ${m.border}`,
                        }}
                        onPointerDown={startHold}
                        onPointerUp={endHold}
                        onPointerLeave={endHold}
                    >
                        <span>{m.icon}</span>
                        <span
                            className="font-bold text-sm"
                            style={{ color: m.color }}
                        >
                            {m.label}
                        </span>
                        <span
                            className="text-xs font-semibold"
                            style={{ color: m.color, opacity: 0.7 }}
                        >
                            · {m.sub}
                        </span>
                    </div>
                </div>
            </header>

            <main
                style={{ maxWidth: "680px", margin: "0 auto", padding: "16px" }}
            >
                <div className="bg-white rounded-3xl shadow-lg p-5">
                    {atelier === "tg" && <AtelierTangram key="tg" log={log} />}
                    {atelier === "dq" && <AtelierDisques key="dq" log={log} />}
                    {atelier === "cu" && (
                        <AtelierCuisenaire key="cu" log={log} />
                    )}
                </div>
                <p className="text-center text-xs text-slate-300 font-semibold mt-4 no-print">
                    Séquence fractions CE1 · Séance 6/6 · CAREC Grenoble · A.
                    Tricot
                </p>
            </main>

            {showMenu && (
                <TeacherMenu
                    onDash={() => {
                        setShowDash(true);
                        setShowMenu(false);
                    }}
                    onChange={() => {
                        setAtelier(null);
                        setShowMenu(false);
                    }}
                    onClose={() => setShowMenu(false)}
                />
            )}

            {showDash && (
                <Dashboard
                    events={events}
                    atelierMeta={{ ...m, total: totalSits }}
                    startTs={startTs}
                    onClose={() => setShowDash(false)}
                />
            )}
        </div>
    );
}
