const Lead = require('../models/Lead');

// @desc    Crear nuevo lead
// @route   POST /api/leads
// @access  Public
exports.createLead = async (req, res) => {
  try {
    const { nombre, email, servicio, telefono, mensaje, source } = req.body;

    const lead = await Lead.create({
      nombre,
      email,
      servicio,
      telefono,
      mensaje,
      source: source || 'web-form'
    });

    res.status(201).json({
      success: true,
      message: 'Lead registrado exitosamente',
      data: lead
    });

  } catch (error) {
    console.error('Create lead error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un lead con este email'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear lead',
      error: error.message
    });
  }
};

// @desc    Obtener todos los leads (con paginación)
// @route   GET /api/leads
// @access  Private/Admin
exports.getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtros
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { nombre: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { servicio: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'nombre email')
      .populate('notes.createdBy', 'nombre');

    const total = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener leads'
    });
  }
};

// @desc    Obtener lead por ID
// @route   GET /api/leads/:id
// @access  Private/Admin
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'nombre email')
      .populate('notes.createdBy', 'nombre');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });

  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lead'
    });
  }
};

// @desc    Actualizar lead
// @route   PUT /api/leads/:id
// @access  Private/Admin
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'nombre email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead actualizado exitosamente',
      data: lead
    });

  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar lead'
    });
  }
};

// @desc    Agregar nota a lead
// @route   POST /api/leads/:id/notes
// @access  Private/Admin
exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            note,
            createdBy: req.user.id
          }
        }
      },
      { new: true, runValidators: true }
    ).populate('notes.createdBy', 'nombre');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Nota agregada exitosamente',
      data: lead
    });

  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar nota'
    });
  }
};