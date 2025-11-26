const express = require('express');
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  addNote
} = require('../controllers/leadController');
const { validateLead } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', validateLead, createLead);

// Rutas protegidas (solo autenticados)
router.use(authenticate);

// Solo administradores pueden ver y gestionar leads
router.get('/', authorize('admin'), getLeads);
router.get('/:id', authorize('admin'), getLead);
router.put('/:id', authorize('admin'), updateLead);
router.post('/:id/notes', authorize('admin'), addNote);

module.exports = router;