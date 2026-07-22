import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import {
  Tooltip,
  Modal,
  Box,
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { createChat, searchUsers } from "../apis";
import { type Chat, type User } from "../types";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-blue-500",
  "from-violet-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-fuchsia-500 to-indigo-500",
  "from-indigo-500 to-purple-500",
];
function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}
function initialsFor(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    "& fieldset": { borderColor: "#E3E6F0" },
    "&:hover fieldset": { borderColor: "#3F51B5" },
    "&.Mui-focused fieldset": { borderColor: "#3F51B5", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3F51B5" },
};

export default function PanelHeader(props: {
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>;
  collapsed?: boolean;
}) {
  const { collapsed = false } = props;
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState("");
  const [options, setOptions] = useState<User[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      if (searchText.trim().length === 0) return;

      const users = await searchUsers(searchText);
      if (users.status == 200) setOptions(users.data);
    };

    // debounce (wait 300ms)
    const delay = setTimeout(fetch, 300);
    return () => clearTimeout(delay);
  }, [searchText]);

  const createConversation = async () => {
    setLoading(true);
    const res = await createChat(selectedUser?._id);
    setLoading(false);
    if (res.data.chatId) props.setCurrentChat(res.data.chat);
    console.log("res", res);
    if (res.status == 400) setError("A conversation with this user already exists.");
    else if (res.status == 500) setError("Something went wrong. Please try again later.");
    else {
      setOpen(false);
      setSelectedUser(null);
    }
  };

  const closeModal = () => {
    setOpen(false);
    setSelectedUser(null);
    setSearchText("");
    setError("");
  };

  return (
    <>
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && <h2 className="text-white font-semibold text-sm tracking-wide">Your Conversations</h2>}
        <Tooltip title="Add a conversation" arrow>
          <button
            onClick={() => setOpen(true)}
            className="
              w-8 h-8 flex items-center justify-center rounded-full
              bg-white/15 hover:bg-white/25
              transition-colors shadow-sm
              text-white cursor-pointer
            "
          >
            <AddIcon fontSize="small" />
          </button>
        </Tooltip>
      </div>

      <Modal open={open} onClose={closeModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            maxWidth: "calc(100vw - 32px)",
            bgcolor: "background.paper",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(31,41,109,0.25)",
            overflow: "hidden",
          }}
        >
          <div className="flex items-center gap-3 px-6 pt-6 pb-5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-[#3F51B5] shrink-0">
              <PersonAddAlt1Icon fontSize="small" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 leading-tight">Start a new conversation</h3>
              <p className="text-xs text-gray-500 mt-0.5">Search for someone by username</p>
            </div>
            <IconButton
              onClick={closeModal}
              size="small"
              sx={{ position: "absolute", top: 14, right: 14, color: "text.secondary" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          <div className="px-6 pb-6 flex flex-col gap-3">
            <Autocomplete
              options={options}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.username})`}
              inputValue={searchText}
              onInputChange={(_, value, __) => {
                setSearchText(value);
                setPopupOpen(!!value);
              }}
              onChange={(_, value) => {
                setSelectedUser(value);
                setPopupOpen(false);
                setError("");
              }}
              filterOptions={(x) => x}
              open={popupOpen}
              onOpen={() => setPopupOpen(true)}
              onClose={() => setPopupOpen(false)}
              renderInput={(params) => (
                <TextField {...params} label="Search username" variant="outlined" size="small" sx={inputSx} />
              )}
              noOptionsText="No users found"
            />

            {selectedUser && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br ${gradientFor(
                    selectedUser.username || selectedUser.firstName || "default"
                  )}`}
                >
                  {initialsFor(selectedUser.firstName, selectedUser.lastName)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">@{selectedUser.username}</div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 bg-red-50 border border-red-200 text-xs px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <Button
              variant="contained"
              disabled={!selectedUser || loading}
              onClick={createConversation}
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "12px",
                py: 1.1,
                mt: 0.5,
                backgroundColor: "#3F51B5",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#303F9F", boxShadow: "none" },
                "&.Mui-disabled": { backgroundColor: "#E3E6F0", color: "#9CA3AF" },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Create conversation"}
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
}