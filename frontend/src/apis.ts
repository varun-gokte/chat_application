import axios, {AxiosError} from "axios";

const URL = "http://localhost:3000/api"

const signupUser = async (data: {firstName:string, lastName:string, username:string, password:string}) => {
  try{
    const response = await axios.post(`${URL}/user/signup`,data);
     if (response.status==200)
      return {status: 200, data:response.data};
    else
      return {status: response.status, data:""};
  }
  catch(err){
    const error = err as AxiosError;
    if (error.status)
      return {status: error.status, data:""};
    else
      return {status: 500, data:""};
  }
}

const loginUser = async (data: {username:string, password:string}) => {
  try{
    const response = await axios.post(`${URL}/user/login`,data);
    if (response.status==200)
      return {status: 200, data:response.data};
    else
      return {status: response.status, data:""};
  }
  catch(err){
    const error = err as AxiosError;
    if (error.status)
      return {status: error.status, data:""};
    else
      return {status: 500, data:""};
  }
}

const searchUsers = async (query: string) => {
  try {
    const response = await axios.get(`${URL}/users`, {
      params: { search: query },
      headers: { authorization: `Bearer ${localStorage.getItem("chat-token")}` },
    });
    if (response.status==200)
      return {status: 200, data:response.data};
    else
      return {status: response.status, data:[]};
  } catch (err) {
    const error = err as AxiosError;
    if (error.status) 
      return {status: error.status, data:[]};
    return {status: 500, data:[]};
  }
};

const createChat = async (id: string | undefined) => {
  try {
    if (!id)
      return {status: 200, data:""};
    const response = await axios.post(`${URL}/chats/new`, 
      { participantId:id }, 
      { headers: { 
        authorization: `Bearer ${localStorage.getItem("chat-token")}`,
        "Content-Type": "application/json" 
      } }
    );
    if (response.status==200)
      return {status: 200, data:response.data};
    else
      return {status: response.status, data:""};
  } catch (err) {
    const error = err as AxiosError;
    if (error.status) 
      return {status: error.status, data:""};
    return {status: 500, data:""};
  }
};

const getChats = async () => {
  try{
    const response = await axios.get(`${URL}/chats`, {
      headers: {authorization: `Bearer ${localStorage.getItem("chat-token")}`}
    });
    if (response.status==200)
      return {status: 200, data:response.data.chats};
    else
      return {status: response.status, data:[]};
  }
  catch (err) {
    const error = err as AxiosError;
    if (error.status) 
      return {status: error.status, data:[]};
    return {status: 500, data:[]};
  }
}

const createMessage = async ( chatId: string, content: string) => {
  try {
    const response = await axios.post(`${URL}/messages/new`, 
      { chatId, content }, 
      { headers: { 
        authorization: `Bearer ${localStorage.getItem("chat-token")}`,
        "Content-Type": "application/json" 
      } }
    );
    if (response.status==200)
      return {status: 200, data:response.data.message};
    else
      return {status: response.status, data:[]};
  }
  catch (err) {
    const error = err as AxiosError;
    if (error.status) 
      return {status: error.status, data:[]};
    return {status: 500, data:[]};
  }
};

const getMessages = async (chatId:string) => {
  try{
    const response = await axios.get(`${URL}/messages`, {
      params: {chatId },
      headers: { authorization: `Bearer ${localStorage.getItem("chat-token")}` },
    });
    if (response.status==200)
      return {status: 200, data:response.data.messages};
    else
      return {status: response.status, data:[]};
  }
  catch (err) {
    const error = err as AxiosError;
    if (error.status) 
      return {status: error.status, data:[]};
    return {status: 500, data:[]};
  }
};

export {
  signupUser, loginUser, 
  searchUsers, 
  createChat, getChats,
  createMessage, getMessages
}