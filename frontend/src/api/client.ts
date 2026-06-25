import axios from 'axios';
import { useAuthStore} from '../store/auth.store';

const API_BASE_URL =import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient =axios.create({
    baseURL: API_BASE_URL,
    headers: {'Content-Type':'application/json'},
})

apiClient.interceptors.request.use((config)=>{
    const token = useAuthStore.getState().accessToken
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})