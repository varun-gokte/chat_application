import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import type { AuthToken, User } from "../types";
import { useNavigate } from "react-router-dom";

const AVATAR_COLORS = [
  "#E91E63", "#9C27B0", "#3F51B5", "#009688",
  "#FF5722", "#607D8B", "#795548", "#00BCD4",
];

function getAvatarColor(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function ProfileAvatar({ user, setToken }: {user: User, setToken: React.Dispatch<React.SetStateAction<AuthToken | null>>}) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<any>(null);

    let name = "";
    if (user.firstName) name+=user.firstName;
    if (user.lastName) name+=(name?" ":"")+user.lastName;
    const username = user.username || "";

    const initials = (user.firstName?.charAt(0) || "") + (user.lastName?.charAt(0) || "");
    const avatarColor = getAvatarColor(name);

    useEffect(() => {
    const handler = (e: MouseEvent) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
    }, []);

    const menuItems = [
    { label: "Settings", Icon: SettingsIcon, onClick: () => console.log("Settings") },
    { label: "Friends", Icon: GroupIcon,    onClick: () => console.log("Friends") },
    ];

    return (
    <div ref={wrapRef} className="relative">
        {/* Avatar button */}
        <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium
                    border-2 transition-all duration-150 cursor-pointer select-none
                    hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/70"
        style={{
            backgroundColor: avatarColor,
            borderColor: open ? "white" : "rgba(255,255,255,0.4)",
        }}
        aria-label="Open profile menu"
        aria-expanded={open}
        >
        {initials}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
        {open && (
            <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.94, y: -6  }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-60 z-50 overflow-hidden
                        bg-white dark:bg-neutral-900
                        border border-black/[0.07] dark:border-white/[0.1]
                        rounded-xl shadow-xl shadow-black/10"
            style={{ transformOrigin: "top right" }}
            >
            {/* Profile section */}
            <div className="flex items-center gap-3 px-4 py-4">
                <div
                className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center
                            text-white text-sm font-medium"
                style={{ backgroundColor: avatarColor }}
                >
                {initials}
                </div>
                <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    @{username}
                </p>
                {/* <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full
                                    bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {role}
                </span> */}
                </div>
            </div>

            {/* Divider */}
            <div className="mx-3 border-t border-black/[0.06] dark:border-white/[0.08]" />

            {/* Menu items */}
            <div className="p-2">
                {menuItems.map(({ label, Icon, onClick }) => (
                <button
                    key={label}
                    onClick={() => { onClick(); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left
                                text-gray-700 dark:text-gray-200
                                hover:bg-gray-100 dark:hover:bg-white/[0.06]
                                transition-colors duration-100"
                >
                    <Icon className="opacity-60" />
                    {label}
                </button>
                ))}

                {/* Logout — danger colour */}
                <button
                onClick={() => { 
                    localStorage.removeItem("chat-token");
                    setToken(null);
                    navigate("/login"); 
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left
                            text-red-600 dark:text-red-400
                            hover:bg-red-50 dark:hover:bg-red-900/20
                            transition-colors duration-100"
                >
                <LogoutIcon  />
                Log out
                </button>
            </div>
            </motion.div>
        )}
        </AnimatePresence>
    </div>
);
}