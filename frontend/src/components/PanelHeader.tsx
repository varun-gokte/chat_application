import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Tooltip, Modal, Box, Autocomplete, TextField, Button, CircularProgress, Typography, IconButton } from "@mui/material";
import { createChat, searchUsers } from "../apis";
import { type Chat, type User } from "../types";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

export default function PanelHeader(props: {setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>}) {
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
      if (users.status==200)
        setOptions(users.data);
    };

    // debounce (wait 300ms)
    const delay = setTimeout(fetch, 300);
    return () => clearTimeout(delay);
  }, [searchText]);

  const createConversation = async () => {
    setLoading(true);
    const res = await createChat(selectedUser?._id);
    setLoading(false);
    if (res.data.chatId)
      props.setCurrentChat(res.data.chat);
    console.log('res',res)
    if (res.status==400)
      setError("A conversation with this user already exists.")
    else if (res.status==500)
      setError("Something went wrong. Please try again later.")
    else{
      setOpen(false);
      setSelectedUser(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">Your Conversations</h2>
        <Tooltip title="Add a conversation" arrow className="hover:cursor-pointer">
          <button
            onClick={() => setOpen(true)}
            className="
              pb-1.5 px-1.5 rounded-full 
              bg-white/20 hover:bg-white/30 
              transition-all shadow 
              text-white
            "
          >
            <AddIcon fontSize="small" />
          </button>
        </Tooltip>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 360,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <h3 className="text-lg font-semibold mb-4">Start a new conversation</h3>
          <IconButton onClick={()=>setOpen(false)} sx={{ position: "absolute", top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
          <Autocomplete
            options={options}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.username})`}
            inputValue={searchText}
            onInputChange={(_, value, __) => {
              setSearchText(value);

              if (value) {
                setPopupOpen(true);
              } else {
                setPopupOpen(false);
              }
            }}
            onChange={(_, value) => {
              setSelectedUser(value);
              setPopupOpen(false);
            }}
            filterOptions={(x) => x}
            open={popupOpen}
            onOpen={() => setPopupOpen(true)}
            onClose={() => setPopupOpen(false)}
            renderInput={(params) => (
              <TextField {...params} label="Search username" variant="outlined" />
            )}
            noOptionsText="No users found"
          />
          <small className="text-red-500">{error}</small>
          <br />
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedUser}
            onClick={createConversation}
            fullWidth
          >
            {loading?<CircularProgress size={28} color="inherit"/>:<Typography>Create</Typography>}
          </Button>
        </Box>
      </Modal>
    </>
  );
}
