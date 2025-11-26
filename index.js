const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración moderna de MongoDB (sin las opciones obsoletas)
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) {
      console.log('✅ Using existing MongoDB connection');
      return;
    }

    console.log('🔄 Establishing new MongoDB connection...');
    
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    isConnected = true;
    
    console.log('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
      isConnected = false;
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
  }
};

// Conectar a la base de datos al iniciar
connectDB();

// Middleware para verificar/conectar DB antes de cada request
app.use(async (req, res, next) => {
  if (!isConnected) {
    console.log('🔄 Reconnecting to MongoDB...');
    await connectDB();
  }
  next();
});

// Configuración de CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://albiero-form.vercel.app']
    : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Albiero Backend API is running!',
    environment: process.env.NODE_ENV,
    database: isConnected ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leads', require('./routes/leads'));

// Health check con estado de DB
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handler mejorado
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  // Si es timeout de MongoDB
  if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
    return res.status(503).json({
      success: false,
      message: 'Database connection timeout. Please try again.',
      code: 'DB_TIMEOUT'
    });
  }
  
  // Si es error de conexión a MongoDB
  if (error.name === 'MongoNetworkError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection error. Please try again.',
      code: 'DB_CONNECTION_ERROR'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});