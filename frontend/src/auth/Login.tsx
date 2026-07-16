import { useState } from "react";
import { TextField, Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { loginUser } from "../apis";
import { Link, useNavigate } from "react-router-dom";
import type { AuthToken } from "../types";
import { jwtDecode } from "jwt-decode";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    "& fieldset": { borderColor: "#E3E6F0" },
    "&:hover fieldset": { borderColor: "#3F51B5" },
    "&.Mui-focused fieldset": { borderColor: "#3F51B5", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3F51B5" },
};

export default function LoginPage({ setToken }: { setToken: React.Dispatch<React.SetStateAction<AuthToken | null>> }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    loginUser(form).then((res) => {
      setLoading(false);
      if (res.status == 200) {
        try {
          const decoded: AuthToken = jwtDecode(res.data);
          setToken(decoded);
          localStorage.setItem("chat-token", res.data);
          navigate("/");
        } catch {
          setFormError("Something went wrong. Please try again later.");
        }
      } else if (res.status == 400) {
        setFormError("Username or password is incorrect.");
      } else {
        setFormError("Something went wrong. Please try again later.");
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F7F8FC] p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md border border-gray-100"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3F51B5] flex items-center justify-center mb-4">
            <ChatBubbleIcon fontSize="small" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-1">Log in to continue to your chats</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <TextField
              label="Username"
              name="username"
              fullWidth
              variant="outlined"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
              sx={inputSx}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              variant="outlined"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              sx={inputSx}
            />
          </motion.div>

          {formError && (
            <div className="text-red-600 bg-red-50 border border-red-200 text-sm px-3 py-2 rounded-lg">
              {formError}
            </div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: "12px",
                py: 1.3,
                backgroundColor: "#3F51B5",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#303F9F", boxShadow: "none" },
                "&.Mui-disabled": { backgroundColor: "#C5CAE9", color: "#fff" },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Log In"}
            </Button>
          </motion.div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Not a user yet?{" "}
          <Link to="/signup" className="text-[#3F51B5] font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}