const express = require('express');
const router = express.Router();
const {dashboard} = require('../controllers/dashboardController');

//Rutas principales
router.get('/', (request, response) => {
    return response.render('home', { showSidebar: false });
});

router.get('/dashboard', dashboard);

router.get('/reportes', (request, response)=> {
    return response.render('enDesarrollo');
});


module.exports = router;