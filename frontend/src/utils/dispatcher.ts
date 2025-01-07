import axios from "axios";

const dispatch = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // backend URL
});

export default dispatch;
