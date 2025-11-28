require('dotenv').config();

// Determinar el ambiente: 
// 1. Si NODE_ENV está configurado, usarlo
// 2. Si estamos en Render (detectado por RENDER=true o PORT), usar 'production'
// 3. Si no, usar 'development'
let env = process.env.NODE_ENV;

if (!env) {
  // Render establece PORT automáticamente, así que si PORT existe y no es el default local, probablemente estamos en producción
  if (process.env.RENDER === 'true' || (process.env.PORT && process.env.PORT !== '3001')) {
    env = 'production';
  } else {
    env = 'development';
  }
}

console.log(`Running migrations in ${env} environment...`);

const { execSync } = require('child_process');

try {
  execSync(`npx sequelize-cli db:migrate --env ${env}`, {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: env }
  });
  console.log('Migrations completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}

