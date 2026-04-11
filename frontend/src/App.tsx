import { Route, Routes } from "react-router-dom"
import SignupPage from "./auth/Signup"
import LoginPage from "./auth/Login"
import Navbar from "./components/Navbar"
import HomePage from "./HomePage"
import {jwtDecode} from "jwt-decode";
import { useEffect, useState } from "react"
import type { AuthToken } from "./types"

function App() {
  const [token, setToken] = useState< AuthToken | null>(null);

  useEffect(()=>{
    const initialToken = localStorage.getItem("chat-token");
    let decoded: AuthToken | null = null;

    if (initialToken){
      try {
        decoded = jwtDecode(initialToken);
        const now = Date.now()/1000;
        
        if (!decoded?.exp || decoded.exp<now){
          localStorage.removeItem("chat-token");
          decoded = null;
        }
      }
      catch {
        localStorage.removeItem("chat-token");
        decoded = null;
      }
    }
    setToken(decoded)
  },[]);

  return (
    <div>
      <Navbar token={token} setToken={setToken} />
      <Routes>
        <Route path="/signup" element={<SignupPage setToken={setToken}/>} />
        <Route path="/login" element={<LoginPage setToken={setToken}/>} />
        <Route path="/" element={<HomePage token={token}/>} /> 
      </Routes>
    </div>
  )
}


export default App;