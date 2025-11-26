require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Ya existe un usuario administrador');
      process.exit(0);
    }

    // Crear admin
    const admin = await User.create({
      nombre: 'Administrador',
      email: 'admin@albiero.com',
      password: 'admin123', // Cambia esto en producción!
      role: 'admin',
      telefono: '+5491112345678'
    });

    console.log('✅ Usuario administrador creado:');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: admin123`);
    console.log('⚠️  Cambia la contraseña inmediatamente!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdminUser();