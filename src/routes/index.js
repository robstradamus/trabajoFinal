const express = require('express');
const router = express.Router();
const {dashboard} = require('../controllers/dashboardController');

//Rutas principales
router.get('/', (request, response) => {
    return response.render('home');
});

router.get('/dashboard', dashboard);

module.exports = router;