const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['https://albiero-form.vercel.app', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conexión MÍNIMA - MongoDB Atlas maneja SSL automáticamente
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    // Solo timeouts, sin opciones SSL
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Reconectar
    setTimeout(connectDB, 5000);
  }
};

// Eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
  // Reconectar automáticamente
  setTimeout(connectDB, 5000);
});

// Iniciar conexión
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leads', require('./routes/leads'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 API Running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    success: mongoose.connection.readyState === 1,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    config: mongoose.connection.config
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
});