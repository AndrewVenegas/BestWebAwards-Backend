# BestWebAwards Backend

Backend de la aplicación BestWebAwards construido con Node.js, Express, Sequelize y PostgreSQL.

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales de base de datos, JWT secret y Cloudinary.

3. Ejecutar migraciones:
```bash
npm run migrate
```

4. Ejecutar seed (poblar base de datos con CSV):
```bash
npm run seed
```

5. Iniciar servidor:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## Estructura

- `models/` - Modelos de Sequelize
- `migrations/` - Migraciones de base de datos
- `seeders/` - Scripts de seed
- `controllers/` - Controladores de las rutas
- `routes/` - Definición de rutas
- `middlewares/` - Middlewares de autenticación y autorización
- `config/` - Configuración de base de datos y Cloudinary

## Endpoints principales

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/students/me` - Obtener perfil del estudiante
- `GET /api/teams` - Listar equipos participantes
- `POST /api/votes` - Crear voto
- `GET /api/results/podium` - Obtener podio de ganadores
- Y muchos más...
