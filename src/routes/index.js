const express = require('express');
const router = express.Router();

//Rutas principales
router.get('/', (request, response) => {
    return response.render('home');
});

router.get('/dashboard', (request, response) => {
    return response.render('dashboard')
});

module.exports = router;