import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import BoltIcon from "@mui/icons-material/Bolt";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DevicesIcon from "@mui/icons-material/Devices";
import GitHubIcon from "@mui/icons-material/GitHub";

// Replace with your actual repo URL
const GITHUB_URL = "https://github.com/your-username/your-repo";

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

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7F8FC]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#3F51B5] to-[#2E3B8F] text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
            <BoltIcon />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Real-time messaging,<br className="hidden sm:block" /> built from scratch
          </h1>
          <p className="mt-4 text-white/75 text-base sm:text-lg max-w-xl">
            A full-stack chat application with instant delivery, read receipts, and live presence —
            powered by WebSockets end to end.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-16">
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