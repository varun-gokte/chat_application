import { AppBar, Box, Button, Toolbar, Typography, Tooltip, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import GitHubIcon from "@mui/icons-material/GitHub";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import type { AuthToken } from "../types";
import ProfileAvatar from "./ProfileAvatar";

const GITHUB_URL = "https://github.com/varun-gokte/chat_application";

export default function Navbar({ token, setToken }: { token: AuthToken | null; setToken: React.Dispatch<React.SetStateAction<AuthToken | null>> }) {

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
        <Toolbar sx={{ gap: 2 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
            <ChatBubbleIcon sx={{ fontSize: 22 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Chat Application
            </Typography>
          </Link>

          

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="View source code on GitHub" arrow>
            <IconButton
              component="a"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "#fff", opacity: 0.85, "&:hover": { opacity: 1, backgroundColor: "rgba(255,255,255,0.1)" } }}
            >
              <GitHubIcon fontSize="medium" />
            </IconButton>
          </Tooltip>

          {token ? (
            <ProfileAvatar user={{ firstName: token.firstName, lastName: token.lastName, username: token.username || "" }} setToken={setToken} />
          ) : (
            <>
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
                <Link to="/signup" style={{ color: "inherit", textDecoration: "none" }}>
                  Sign Up
                </Link>
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
                <Link to="/login" style={{ color: "inherit", textDecoration: "none" }}>
                  Login
                </Link>
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}