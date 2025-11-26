const config = {
  development: {
    API_URL: 'http://localhost:5000/api'
  },
  production: {
    API_URL: 'https://albiero-backend.vercel.app/api' // Cambia esto por tu URL real del backend
  }
};

// Determina el entorno automáticamente
const getConfig = () => {
  // Si estamos en el navegador, usa window.location
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' 
      ? config.development 
      : config.production;
  }
  
  // Si estamos en el servidor (SSR), usa process.env
  return process.env.NODE_ENV === 'development' 
    ? config.development 
    : config.production;
};

export default getConfig();