const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS
app.use(cors({
  origin: ['https://albiero-form.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuración optimizada para MongoDB Atlas en Vercel
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 5,
  minPoolSize: 1,
  // Configuración SSL/TLS CORRECTA para MongoDB Atlas
  ssl: true,
  // Estas son las opciones correctas para versiones modernas:
  tls: true,
  retryWrites: true,
  w: 'majority'
};

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected && mongoose.connection.readyState === 1) {
      console.log('✅ Using existing MongoDB connection');
      return;
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    
    // Cerrar conexión existente si hay alguna
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    isConnected = true;
    
    console.log('✅ MongoDB Atlas connected successfully');

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    isConnected = false;
    
    // Reconectar después de 5 segundos
    setTimeout(connectDB, 5000);
  }
};

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB Atlas');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
  isConnected = false;
});

// Conectar al iniciar
connectDB();

// Middleware para verificar conexión antes de rutas API
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log('🔄 Database not ready, attempting reconnect...');
    try {
      await connectDB();
      // Pequeña pausa para permitir la conexión
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      return res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable',
        code: 'DATABASE_UNAVAILABLE'
      });
    }
  }
  next();
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Albiero Backend API is running!',
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leads', require('./routes/leads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Ruta de debug
app.get('/api/debug', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    res.json({
      mongooseState: states[state],
      readyState: state,
      connectionString: process.env.MONGODB_URI ? '✅ Present' : '❌ Missing',
      environment: process.env.NODE_ENV,
      nodeVersion: process.version
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Manejo de rutas 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  if (error.name.includes('Mongo') || error.name.includes('Mongoose')) {
    return res.status(503).json({
      success: false,
      message: 'Database service temporarily unavailable',
      code: 'DATABASE_ERROR'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔧 Node version: ${process.version}`);
});