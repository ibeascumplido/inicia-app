// En Vercel (mismo dominio), dejar REACT_APP_BACKEND_URL vacío → las peticiones van a /api
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const API = `${BACKEND_URL}/api`;
