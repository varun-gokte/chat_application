import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import type { AuthToken } from "../types";

export default function Navbar({token, setToken}:{token:AuthToken | null, setToken: React.Dispatch<React.SetStateAction<AuthToken | null>>}){
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#3F51B5",
          color: "#fff",
        }}
        elevation={2}
      >
        <Toolbar sx={{ gap: 3 }}>
          <Link to="/">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Chat Application
            </Typography>
          </Link>
          <Typography
            component="a"
            href="/about"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
              opacity: 0.9,
              "&:hover": {
                textDecoration: "underline",
                opacity: 1,
              },
            }}
          >
            About this app
          </Typography>
          {token
            ?<Button
              variant="outlined"
              sx={{
                textTransform: "none",
                borderColor: "white",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderColor: "white",
                },
              }}
              onClick={()=>{
                localStorage.removeItem("chat-token");
                setToken(null);
                navigate("/login");
              }}
            >
              <Link to="/login">Logout</Link>
            </Button>
            :<>
              <Button
                sx={{
                  textTransform: "none",
                  backgroundColor: "#fff",
                  color: "#3F51B5",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.85)",
                  },
                }}
              >
                <Link to="/signup">Sign Up</Link>
              </Button>

              <Button
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderColor: "white",
                  },
                }}
              >
                <Link to="/login">Login</Link>
              </Button>
          </>
          }
        </Toolbar>
      </AppBar>
    </Box>
  )
}