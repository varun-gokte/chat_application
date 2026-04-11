import { useState } from "react";
import { TextField, Button, CircularProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { loginUser } from "../apis";
import { Link, useNavigate } from "react-router-dom";
import type { AuthToken } from "../types";
import {jwtDecode} from "jwt-decode";

export default function LoginPage({setToken}: {setToken:React.Dispatch<React.SetStateAction<AuthToken | null>>}) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    loginUser(form).then(res=>{
      setLoading(false);
      if (res.status==200){
        try{
          const decoded:AuthToken = jwtDecode(res.data);        
          setToken(decoded);
          localStorage.setItem("chat-token",res.data);
          navigate("/");
        }
        catch{
          setFormError("Something went wrong. Please try again later.");
        }
      }
      if (res.status==400)
        setFormError("Username or password is incorrect.");
      else
        setFormError("Something went wrong. Please try again later.");
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md"
      >
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-gray-800 mb-8 text-center"
        >
          Log In
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <TextField
              label="Username"
              name="username"
              fullWidth
              variant="outlined"
              value={form.username}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              variant="outlined"
              value={form.password}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="py-3 !bg-blue-600 hover:!bg-blue-700 text-lg"
            >
              {loading?<CircularProgress size={28} color="inherit"/>:<Typography>Log In</Typography>}
            </Button>
          </motion.div>
        </form>
        <p className="text-red-500 text-base">{formError}</p>

        <p className="mt-6 text-center text-gray-600">
          Not a user yet?{" "}
          <Link to="/signup" className="text-blue-600 font-medium cursor-pointer">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
