const express = require('express');
const { body } = require('express-validator');
const { route } = require('.');
const router = express.Router();

router.get('/venta/listado', (request, response) => {
    return response.render('venta/listado');
});
router.get('/venta/registrar', (request, response) => {
    return response.render('venta/registrar');
});


module.exports = router;