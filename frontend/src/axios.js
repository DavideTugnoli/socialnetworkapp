import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/", // indirizzo del tuo backend
  withCredentials: true, // per inviare il cookie di sessione con ogni richiesta
});

export default instance;
