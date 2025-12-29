# *Proyecto Final - TUP*

# Sistema de Gestión de Ventas y Stock - Mini Mercado La Margen

## Descripcion del Proyecto
Sistema web completo para la gestión de un mini mercado, desarrollado como Proyecto Final para la carrera de la Tecnicatura Universitaria en Programación de la UTN. Permite administrar ventas, compras, inventario, clientes, proveedores y generación de reportes con PDF.

**Estado del proyecto:** **Finalizado y Aprobado**

## Características
- Gestión de ventas y compras
- Control de inventario por sector (Carnicería/Almacén)
- Administración de clientes y proveedores
- Registro de gastos internos
- Generación de reportes con PDF 
- Dashboard con métricas en tiempo real

---
## Estructura del Proyecto
```bash
├── backups/reportes # Reportes PDF generado por el sistema
├── src/ # Código fuente de la aplicación
├── public/ # Archivos estáticos/scripts
├── package.json # Dependencias y scripts del proyecto
├── README.md # Documentación del proyecto
```
---
## Tecnologias usadas
### Backend
* Node.js + Express.js
* MySQL con Sequelize
# Frontend
* Handlebars (Motor de plantillas HTML)
* Bootstrap 5
### Reportes 
* Puppeteer (PDF)
### Herramientas
* npm (gestor de paquetes)
* Git (control de versiones)
---
## Iniciar Proyecto
### Instalacion de Dependencias

```bash
npm install
```

* Instalar Libreria de PDF Puppeteer 
```bash
npm install puppeteer
```

### Iniciar Servidor 
```bash
npm run inicio
```
*Notas: Puerto del servidor: http://localhost:5000*

---
## Capturas del Sistema

### Pagina de Inicio
![Pantalla de Inicio](/public/images/01_inicio.png)
---
### Dashboard Principal
![Dashboard del Sistema](/public/images/02_dashboard.png)
---
### Gestion de Ventas
![Modulo de Ventas](/public/images/03_registro_ventas.png)
---
### Gestion de Cuentas Corrientes
![Modulo de Cuentas Corrientes](/public/images/10_cuentas_corrientes.png)
---
### Reportes PDF
![Generacion de Reportes](/public/images/04_reportes_pdf.png)
---
## Equipo de Desarrollo
### Desarrolladores
**Robinson** - [@robstradamus](https://github.com/robstradamus)
**Valentin** - [@VNGNDev](https://github.com/VNGNDev)
**Tiago** - [@T14G0-C4R4C0L](https://github.com/T14G0-C4R4C0L)
---
### Contribuciones
Trabajo colaborativo en todas las capas del Sistema:
- **Frontend**: Bootstrap 5, Handlebars
- **Backend**: Node.js, Express.js, Sequelize, MySQL
- **Reportes**: Puppeteer para generacion de PDF
- **Testing**: Validacion integral del Sistema
---
**Nota:** Este Proyecto fue desarrollado como trabajo final colaborativo para la carrera 
