const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const checkRole = require('../../middlewares/roles');

const controller = require('./taxonomia.controller');

// GET
router.get('/', auth, controller.getTaxonomias);

// GET ID
router.get('/:id', auth, controller.getTaxonomiaById);

// POST (admin)
router.post('/', auth, checkRole([1]), controller.createTaxonomia);

// DELETE (admin)
router.delete('/:id', auth, checkRole([1]), controller.deleteTaxonomia);

module.exports = router;