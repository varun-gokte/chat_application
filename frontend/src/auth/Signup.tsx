import { useState } from "react";
import { TextField, Button, Typography, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { signupUser } from "../apis";
import { Link, useNavigate } from "react-router-dom";
import type { AuthToken } from "../types";
import { jwtDecode } from "jwt-decode";

export default function SignupPage({setToken}: {setToken:React.Dispatch<React.SetStateAction<AuthToken | null>>}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });
  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();
  
  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;

    if (name === "username") {
      if (value.includes(" "))
        setUsernameError("Username cannot contain spaces.");
      else
        setUsernameError("");
      }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    if (usernameError) return;
    signupUser(form).then(res=>{
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
        setUsernameError("Username is taken.");
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
          Create Your Account
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              variant="outlined"
              value={form.firstName}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              variant="outlined"
              value={form.lastName}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <TextField
              label="Username"
              name="username"
              fullWidth
              variant="outlined"
              value={form.username}
              onChange={handleChange}
              error={Boolean(usernameError)}
              helperText={usernameError}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="py-3 !bg-blue-600 hover:!bg-blue-700 text-lg"
            >
              {loading?<CircularProgress size={28} color="inherit"/>:<Typography>Sign Up</Typography>}
            </Button>
          </motion.div>
        </form>
        <p className="text-red-500 text-base">{formError}</p>

        <p className="mt-6 text-center text-gray-600">
          Already a user?{" "}
          <Link to="/login" className="text-blue-600 font-medium cursor-pointer">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}