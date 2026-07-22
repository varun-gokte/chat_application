import { useEffect, useRef } from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import BoltIcon from "@mui/icons-material/Bolt";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DevicesIcon from "@mui/icons-material/Devices";
import GitHubIcon from "@mui/icons-material/GitHub";

const GITHUB_URL = "https://github.com/varun-gokte/chat_application";

const FEATURES = [
  {
    icon: <BoltIcon fontSize="small" />,
    title: "Real-time messaging",
    description: "Messages, delivery, and typing status sync instantly over WebSockets — no polling.",
  },
  {
    icon: <DoneAllIcon fontSize="small" />,
    title: "Read receipts",
    description: "Sent, delivered, and read states update live as the other person views your message.",
  },
  {
    icon: <LockOutlinedIcon fontSize="small" />,
    title: "Secure by default",
    description: "Passwords are hashed, never exposed in API responses, and auth is token-based.",
  },
  {
    icon: <DevicesIcon fontSize="small" />,
    title: "Responsive design",
    description: "A single-column layout on mobile, side-by-side panels on desktop.",
  },
];

const TECH_STACK = ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Socket.io", "MUI", "Tailwind CSS"];

function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full max-w-3xl">
      <div className="bg-white rounded-2xl p-1.5 shadow-2xl">
        <div className="rounded-xl overflow-hidden ring-1 ring-black/5 bg-[#1E1F2E]">
          <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#23243A]">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 bg-white/10 rounded-md px-3 py-1 text-[11px] text-white/60 font-mono truncate">
              chat-app-varun.vercel.app
            </div>
          </div>

          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="auto"
            poster="/demo-poster.jpg"
            className="w-full h-auto block"
            aria-label="Screen recording of two users exchanging messages in real time"
          >
            <source src="/demo.webm" type="video/webm" />
            <source src="/demo.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-white/50">
        Screen recording of two accounts messaging live over WebSockets
      </p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7F8FC]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#3F51B5] to-[#2E3B8F] text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24 grid grid-cols-1 lg:grid-cols-5 gap-14 items-center">
          {/* Copy + CTAs — narrower */}
          <div className="lg:col-span-2 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <BoltIcon />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              Real-time messaging,
              <br className="hidden sm:block" /> built from scratch
            </h1>
            <p className="mt-4 text-white/75 text-base sm:text-lg max-w-xl">
              A full-stack chat application with instant delivery, read receipts, and live presence —
              powered by WebSockets end to end. Watch it work below, or sign in and try it yourself.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                size="large"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  color: "#3F51B5",
                  px: 3,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                }}
              >
                Get started
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                size="large"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "#fff",
                  px: 3,
                  "&:hover": { borderColor: "#fff", backgroundColor: "rgba(255,255,255,0.08)" },
                }}
              >
                Log in
              </Button>
            </div>
          </div>

          {/* Demo video */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end">
            <DemoVideo />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#3F51B5] flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{f.title}</div>
                <div className="text-sm text-gray-500 mt-1 leading-relaxed">{f.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center text-xs font-semibold tracking-wider text-gray-400 uppercase mb-4">
          Built with
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#3F51B5] transition-colors"
          >
            <GitHubIcon fontSize="small" />
            View source on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}