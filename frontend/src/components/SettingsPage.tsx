import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { AuthToken } from "../types";
import { changeUserInfo } from "../apis";

const PRIMARY = "#3F51B5";

function SettingsSection({ icon, title, description, children }: { icon: React.ReactNode; title: string; description?: string; children: React.ReactNode }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 4 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "rgba(63,81,181,0.1)",
            color: PRIMARY,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
      {children}
    </Paper>
  );
}

export default function SettingsPage({ token, setToken }: {token: AuthToken | null; setToken: React.Dispatch<React.SetStateAction<AuthToken | null>>}) {
  const [firstName, setFirstName] = useState(token?.firstName || "");
  const [lastName, setLastName] = useState(token?.lastName || "");
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (token) {
      setFirstName(token.firstName || "");
      setLastName(token.lastName || "");
      console.log(token)
    }
  }, [token]);

  const handleSaveName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setProfileStatus({ type: "error", message: "First and last name cannot be empty." });
      return;
    }
    if (firstName.trim() == token?.firstName && lastName.trim() == token?.lastName) {
      return;
    }
    changeUserInfo({ firstName: firstName.trim(), lastName: lastName.trim() }).then((res) => {
      if (res.status === 200) {
        setProfileStatus({ type: "success", message: "Name updated." });
        setToken((prev) => prev ? { ...prev, firstName: firstName.trim(), lastName: lastName.trim() } : prev);
      } else {
        setProfileStatus({ type: "error", message: "Failed to update name." });
      }
    });
  };

  const handleSavePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords don't match." });
      return;
    }
    // if (newPassword.length < 8) {
    //   setPasswordStatus({ type: "error", message: "Password must be at least 8 characters." });
    //   return;
    // }

    changeUserInfo({ currentPassword: currentPassword, newPassword: newPassword }).then((res) => {
      if (res.status === 200) {
        setPasswordStatus({ type: "success", message: "Password changed." });
      } else {
        setPasswordStatus({ type: "error", message: "Failed to change password." });
      }
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Box sx={{ backgroundColor: "#F7F8FC", minHeight: "100vh", py: { xs: 4, sm: 6 } }}>
      <Box sx={{ maxWidth: 640, mx: "auto", px: 2 }}>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: PRIMARY,
              fontWeight: 600,
              fontSize: 20,
            }}
          >
            {(token?.firstName?.[0] || "").toUpperCase()}
            {(token?.lastName?.[0] || "").toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Account settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your profile and password
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={3}>
          <SettingsSection
            icon={<PersonOutlineIcon />}
            title="Profile"
            description="This is how your name appears to other people in chats."
          >
            <Box component="form" onSubmit={handleSaveName}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Stack>
                {profileStatus && (
                  <Alert severity={profileStatus.type} onClose={() => setProfileStatus(null)}>
                    {profileStatus.message}
                  </Alert>
                )}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      backgroundColor: PRIMARY,
                      "&:hover": { backgroundColor: "#334299" },
                    }}
                  >
                    Save name
                  </Button>
                </Box>
              </Stack>
            </Box>
          </SettingsSection>

          <SettingsSection
            icon={<LockOutlinedIcon />}
            title="Password"
            description="Choose a strong password you don't use elsewhere."
          >
            <Box component="form" onSubmit={handleSavePassword}>
              <Stack spacing={2}>
                <TextField
                  label="Current password"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((s) => !s)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="New password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Confirm new password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  size="small"
                />
                {passwordStatus && (
                  <Alert severity={passwordStatus.type} onClose={() => setPasswordStatus(null)}>
                    {passwordStatus.message}
                  </Alert>
                )}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      backgroundColor: PRIMARY,
                      "&:hover": { backgroundColor: "#334299" },
                    }}
                  >
                    Change password
                  </Button>
                </Box>
              </Stack>
            </Box>
          </SettingsSection>

          {/* <SettingsSection
            icon={<DeleteOutlineIcon sx={{ color: "#D32F2F" }} />}
            title="Delete account"
            description="Permanently delete your account and all your messages. This can't be undone."
          >
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="error"
                sx={{ textTransform: "none" }}
              >
                Delete my account
              </Button>
            </Box>
          </SettingsSection> */}
        </Stack>
      </Box>
    </Box>
  );
}