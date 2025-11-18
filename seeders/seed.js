const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');
const db = require('../models');

const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const seed = async () => {
  try {
    console.log('Iniciando seed...');

    // Leer CSV files
    const adminsData = await readCSV(path.join(__dirname, '../admins.csv'));
    const helpersData = await readCSV(path.join(__dirname, '../ayudantes.csv'));
    const studentsData = await readCSV(path.join(__dirname, '../alumnos.csv'));
    const teamsData = await readCSV(path.join(__dirname, '../equipos.csv'));

    // Sincronizar base de datos
    await db.sequelize.sync({ force: false });
    console.log('Base de datos sincronizada');

    // Limpiar tablas (opcional, comentar si no quieres limpiar)
    // await db.Vote.destroy({ where: {} });
    // await db.Student.destroy({ where: {} });
    // await db.Team.destroy({ where: {} });
    // await db.Helper.destroy({ where: {} });
    // await db.Admin.destroy({ where: {} });
    // await db.Config.destroy({ where: {} });

    // Crear Admins
    console.log('Creando admins...');
    for (const admin of adminsData) {
      const passwordHash = await hashPassword(admin.password);
      await db.Admin.findOrCreate({
        where: { email: admin.mail },
        defaults: {
          id: parseInt(admin.id),
          name: admin.name,
          email: admin.mail,
          passwordHash: passwordHash,
          role: 'admin'
        }
      });
    }
    console.log(`${adminsData.length} admins creados`);

    // Crear Helpers
    console.log('Creando helpers...');
    for (const helper of helpersData) {
      const passwordHash = await hashPassword(helper.password);
      await db.Helper.findOrCreate({
        where: { email: helper.mail },
        defaults: {
          id: parseInt(helper.id),
          name: helper.name,
          email: helper.mail,
          passwordHash: passwordHash
        }
      });
    }
    console.log(`${helpersData.length} helpers creados`);

    // Crear Teams
    console.log('Creando teams...');
    for (const team of teamsData) {
      await db.Team.findOrCreate({
        where: { groupName: team.groupName },
        defaults: {
          groupName: team.groupName,
          helperId: parseInt(team.ayudanteId),
          participates: false
        }
      });
    }
    console.log(`${teamsData.length} teams creados`);

    // Crear Students
    console.log('Creando students...');
    for (const student of studentsData) {
      const passwordHash = await hashPassword(student.password);
      const team = await db.Team.findOne({ where: { groupName: student.groupName } });
      
      await db.Student.findOrCreate({
        where: { email: student.mail },
        defaults: {
          name: student.name,
          email: student.mail,
          passwordHash: passwordHash,
          teamId: team ? team.id : null,
          hasSeenIntro: false
        }
      });
    }
    console.log(`${studentsData.length} students creados`);

    // Crear Config inicial
    console.log('Creando config...');
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30); // 30 días desde ahora
    
    await db.Config.findOrCreate({
      where: { id: 1 },
      defaults: {
        id: 1,
        votingDeadline: defaultDeadline
      }
    });
    console.log('Config creado');

    console.log('Seed completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
};

seed();

