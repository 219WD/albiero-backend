const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  servicio: {
    type: String,
    required: [true, 'El servicio es requerido'],
    trim: true,
    maxlength: [200, 'El servicio no puede tener más de 200 caracteres']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  mensaje: {
    type: String,
    trim: true,
    maxlength: [1000, 'El mensaje no puede tener más de 1000 caracteres']
  },
  source: {
    type: String,
    default: 'web-form'
  },
  status: {
    type: String,
    enum: ['nuevo', 'contactado', 'convertido', 'perdido'],
    default: 'nuevo'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    note: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  versionKey: false
});

// Indexes para mejor performance
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Lead', leadSchema);