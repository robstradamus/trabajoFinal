// Configuarciones y rutas
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const { engine } = require('express-handlebars');
const passport = require('passport');
require('dotenv').config();
require('./config/asociaciones');
const app = express();
require('./config/asociaciones');

//Importar Rutas AQUI -------------
const indexRoutes = require('./routes/index');
const proveedorRoutes = require('./routes/proveedorRoutes');
const productoRoutes = require('./routes/productoRoutes');
const compraRoutes = require('./routes/compraRoutes');


//Configuracion de sesiones
app.use(session({
    secret: process.env.COD_ENCRYPT,
    resave: false,
    saveUninitialized: false,
    name : 'secret-name',
    cookie:{
        expires: 600000 //10 minutos
    }
}));
//Configuracion del passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((request, response, next) => {
    response.locals.varEstiloMensaje = request.flash('varEstiloMensaje');
    response.locals.varMensaje = request.flash('varMensaje');
    next();
});
//Configuarcion y creacion de instancia de Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layout'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: function(a, b) { // Funciones Auxiliares
        return a === b;
        },
        gt: function(a,b){
            return a > b;
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
//Archivos estaticos
app.use(express.static(path.join(__dirname, '../public')));
//Parsear JSON y form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- RUTAS IMPORTADAS ----
app.use('/', indexRoutes);
app.use('/', proveedorRoutes);
app.use('/', productoRoutes);
app.use('/', compraRoutes);


module.exports = app;