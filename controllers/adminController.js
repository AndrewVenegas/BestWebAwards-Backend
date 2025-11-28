const bcrypt = require('bcrypt');
const db = require('../models');
const { Op } = require('sequelize');

// CRUD Students
const getStudents = async (req, res) => {
  try {
    const students = await db.Student.findAll({
      include: [{ model: db.Team, as: 'team' }],
      order: [['name', 'ASC']]
    });
    res.json(students);
  } catch (error) {
    console.error('Error en getStudents:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getStudent = async (req, res) => {
  try {
    const student = await db.Student.findByPk(req.params.id, {
      include: [{ model: db.Team, as: 'team' }]
    });
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error en getStudent:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, email, password, teamId } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const student = await db.Student.create({
      name,
      email,
      passwordHash,
      teamId: teamId || null,
      hasSeenIntro: false
    });
    
    res.status(201).json(student);
  } catch (error) {
    console.error('Error en createStudent:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { name, email, teamId, avatarUrl } = req.body;
    const student = await db.Student.findByPk(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    if (name) student.name = name;
    if (email) student.email = email;
    if (teamId !== undefined) student.teamId = teamId;
    if (avatarUrl !== undefined) student.avatarUrl = avatarUrl;
    
    await student.save();
    res.json(student);
  } catch (error) {
    console.error('Error en updateStudent:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await db.Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    await student.destroy();
    res.json({ message: 'Estudiante eliminado' });
  } catch (error) {
    console.error('Error en deleteStudent:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// CRUD Helpers
const getHelpers = async (req, res) => {
  try {
    const helpers = await db.Helper.findAll({
      order: [['name', 'ASC']]
    });
    res.json(helpers);
  } catch (error) {
    console.error('Error en getHelpers:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createHelper = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Normalizar email: trim y lowercase
    const normalizedEmail = email.trim().toLowerCase();
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const helper = await db.Helper.create({
      name,
      email: normalizedEmail,
      passwordHash
    });
    
    res.status(201).json(helper);
  } catch (error) {
    console.error('Error en createHelper:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Error errors:', error.errors);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Verificar si el error es por ID (secuencia desincronizada) o por email
      const idInError = error.errors?.find(e => e.path === 'id');
      const emailInError = error.errors?.find(e => e.path === 'email');
      
      if (idInError) {
        // La secuencia de auto-incremento está desincronizada
        // Arreglar la secuencia automáticamente
        try {
          const maxId = await db.Helper.max('id');
          await db.sequelize.query(`SELECT setval('helpers_id_seq', ${maxId || 0}, true);`);
          console.log(`Secuencia de helpers arreglada. Nuevo valor: ${maxId || 0}`);
          
          // Reintentar la creación
          const helper = await db.Helper.create({
            name,
            email: normalizedEmail,
            passwordHash
          });
          return res.status(201).json(helper);
        } catch (retryError) {
          console.error('Error al arreglar secuencia y reintentar:', retryError);
          return res.status(500).json({ error: 'Error al crear el ayudante. Por favor, contacta al administrador.' });
        }
      }
      
      if (emailInError) {
        return res.status(400).json({ 
          error: 'Ya existe un ayudante con este email'
        });
      }
      
      return res.status(400).json({ 
        error: 'El email ya está en uso'
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors[0]?.message || 'Error de validación' });
    }
    if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error:', error.original);
      return res.status(400).json({ error: 'Error en la base de datos: ' + (error.original?.message || error.message) });
    }
    res.status(500).json({ error: 'Error interno del servidor', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

const updateHelper = async (req, res) => {
  try {
    const { name, email, avatarUrl } = req.body;
    const helper = await db.Helper.findByPk(req.params.id);
    
    if (!helper) {
      return res.status(404).json({ error: 'Ayudante no encontrado' });
    }
    
    if (name) helper.name = name;
    if (email) helper.email = email;
    if (avatarUrl !== undefined) helper.avatarUrl = avatarUrl;
    
    await helper.save();
    res.json(helper);
  } catch (error) {
    console.error('Error en updateHelper:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteHelper = async (req, res) => {
  try {
    const helper = await db.Helper.findByPk(req.params.id);
    if (!helper) {
      return res.status(404).json({ error: 'Ayudante no encontrado' });
    }
    await helper.destroy();
    res.json({ message: 'Ayudante eliminado' });
  } catch (error) {
    console.error('Error en deleteHelper:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// CRUD Admins
const getAdmins = async (req, res) => {
  try {
    const admins = await db.Admin.findAll({
      order: [['name', 'ASC']]
    });
    res.json(admins);
  } catch (error) {
    console.error('Error en getAdmins:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Normalizar email: trim y lowercase
    const normalizedEmail = email.trim().toLowerCase();
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const admin = await db.Admin.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'admin'
    });
    
    res.status(201).json(admin);
  } catch (error) {
    console.error('Error en createAdmin:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Error errors:', error.errors);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Verificar si el error es por ID (secuencia desincronizada) o por email
      const idInError = error.errors?.find(e => e.path === 'id');
      const emailInError = error.errors?.find(e => e.path === 'email');
      
      if (idInError) {
        // La secuencia de auto-incremento está desincronizada
        // Arreglar la secuencia automáticamente
        try {
          const maxId = await db.Admin.max('id');
          await db.sequelize.query(`SELECT setval('admins_id_seq', ${maxId || 0}, true);`);
          console.log(`Secuencia de admins arreglada. Nuevo valor: ${maxId || 0}`);
          
          // Reintentar la creación
          const admin = await db.Admin.create({
            name,
            email: normalizedEmail,
            passwordHash,
            role: 'admin'
          });
          return res.status(201).json(admin);
        } catch (retryError) {
          console.error('Error al arreglar secuencia y reintentar:', retryError);
          return res.status(500).json({ error: 'Error al crear el administrador. Por favor, contacta al administrador.' });
        }
      }
      
      if (emailInError) {
        return res.status(400).json({ 
          error: 'Ya existe un administrador con este email'
        });
      }
      
      return res.status(400).json({ 
        error: 'El email ya está en uso'
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors[0]?.message || 'Error de validación' });
    }
    if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error:', error.original);
      return res.status(400).json({ error: 'Error en la base de datos: ' + (error.original?.message || error.message) });
    }
    res.status(500).json({ error: 'Error interno del servidor', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { name, email, avatarUrl } = req.body;
    const admin = await db.Admin.findByPk(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (avatarUrl !== undefined) admin.avatarUrl = avatarUrl;
    
    await admin.save();
    res.json(admin);
  } catch (error) {
    console.error('Error en updateAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const verifyAdminPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const adminId = req.user.id; // ID del admin logueado
    
    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida' });
    }
    
    const admin = await db.Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    // Obtener número de votos actuales
    const voteCount = await db.Vote.count({
      where: { adminId: adminId }
    });

    const remainingVotes = 3 - voteCount;
    
    res.json({ 
      valid: true,
      remainingVotes: remainingVotes
    });
  } catch (error) {
    console.error('Error en verifyAdminPassword:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMe = async (req, res) => {
  try {
    const admin = await db.Admin.findByPk(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    res.json(admin);
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateMe = async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;
    const admin = await db.Admin.findByPk(req.user.id);

    if (!admin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    if (name !== undefined) admin.name = name;
    if (avatarUrl !== undefined) admin.avatarUrl = avatarUrl || null;

    await admin.save();

    res.json(admin);
  } catch (error) {
    console.error('Error en updateMe:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { password } = req.body;
    const adminId = req.params.id;
    const loggedAdminId = req.user.id; // ID del admin logueado
    
    // Validar que se proporcione la contraseña
    if (!password) {
      return res.status(400).json({ error: 'Se requiere confirmación de contraseña para eliminar un administrador' });
    }
    
    // Verificar la contraseña del admin logueado
    const loggedAdmin = await db.Admin.findByPk(loggedAdminId);
    if (!loggedAdmin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    
    const isValidPassword = await bcrypt.compare(password, loggedAdmin.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    // No permitir que un admin se elimine a sí mismo
    if (parseInt(adminId) === loggedAdminId) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    
    const admin = await db.Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    
    await admin.destroy();
    res.json({ message: 'Administrador eliminado' });
  } catch (error) {
    console.error('Error en deleteAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// CRUD Teams
const getTeams = async (req, res) => {
  try {
    const teams = await db.Team.findAll({
      include: [
        { model: db.Helper, as: 'helper' },
        { model: db.Student, as: 'students' }
      ],
      order: [['groupName', 'ASC']]
    });
    res.json(teams);
  } catch (error) {
    console.error('Error en getTeams:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createTeam = async (req, res) => {
  try {
    const { groupName, displayName, appName, helperId, participates, tipo_app, description } = req.body;
    
    const team = await db.Team.create({
      groupName,
      displayName,
      appName,
      helperId: helperId || null,
      participates: participates || false,
      tipo_app: tipo_app || null,
      description: description || null
    });
    
    res.status(201).json(team);
  } catch (error) {
    console.error('Error en createTeam:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { groupName, displayName, appName, helperId, participates, deployUrl, videoUrl, screenshotUrl, tipo_app, description } = req.body;
    const team = await db.Team.findByPk(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    if (groupName) team.groupName = groupName;
    if (displayName !== undefined) team.displayName = displayName;
    if (appName !== undefined) team.appName = appName;
    if (helperId !== undefined) team.helperId = helperId;
    if (participates !== undefined) team.participates = participates;
    if (deployUrl !== undefined) team.deployUrl = deployUrl;
    if (videoUrl !== undefined) team.videoUrl = videoUrl;
    if (screenshotUrl !== undefined) team.screenshotUrl = screenshotUrl;
    if (description !== undefined) team.description = description;
    if (tipo_app !== undefined) {
      const validTypes = ['Chat', 'E-commerce', 'Juego', 'Planificador', 'Red Social', 'Mix', 'Otro', null, ''];
      if (tipo_app && !validTypes.includes(tipo_app)) {
        return res.status(400).json({ error: 'Tipo de aplicación no válido' });
      }
      team.tipo_app = tipo_app || null;
    }
    
    await team.save();
    res.json(team);
  } catch (error) {
    console.error('Error en updateTeam:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await db.Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    await team.destroy();
    res.json({ message: 'Equipo eliminado' });
  } catch (error) {
    console.error('Error en deleteTeam:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Dashboard
const getVotesSummary = async (req, res) => {
  try {
    // Usar consulta SQL directa para evitar problemas con GROUP BY en Sequelize
    const [results] = await db.sequelize.query(`
      SELECT 
        t.id as "teamId",
        t."groupName",
        t."displayName",
        t."appName",
        t."screenshotUrl",
        COUNT(v.id) as "voteCount"
      FROM teams t
      LEFT JOIN votes v ON v."teamId" = t.id
      WHERE t.participates = true
      GROUP BY t.id, t."groupName", t."displayName", t."appName", t."screenshotUrl"
      ORDER BY "voteCount" DESC
    `);

    const summary = results.map(row => ({
      teamId: parseInt(row.teamId),
      groupName: row.groupName,
      displayName: row.displayName,
      appName: row.appName,
      screenshotUrl: row.screenshotUrl,
      voteCount: parseInt(row.voteCount) || 0
    }));

    res.json(summary);
  } catch (error) {
    console.error('Error en getVotesSummary:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getVotesByStudent = async (req, res) => {
  try {
    const students = await db.Student.findAll({
      include: [
        {
          model: db.Vote,
          as: 'votes',
          include: [
            {
              model: db.Team,
              as: 'team'
            }
          ]
        }
      ],
      order: [['name', 'ASC']]
    });

    const result = students.map(student => ({
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      votes: student.votes.map(vote => ({
        voteId: vote.id,
        teamId: vote.team.id,
        teamName: vote.team.groupName,
        displayName: vote.team.displayName,
        appName: vote.team.appName,
        createdAt: vote.createdAt
      }))
    }));

    res.json(result);
  } catch (error) {
    console.error('Error en getVotesByStudent:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getVotesByHelper = async (req, res) => {
  try {
    const helpers = await db.Helper.findAll({
      include: [
        {
          model: db.Vote,
          as: 'votes',
          include: [
            {
              model: db.Team,
              as: 'team'
            }
          ]
        }
      ],
      order: [['name', 'ASC']]
    });

    const result = helpers.map(helper => ({
      helperId: helper.id,
      helperName: helper.name,
      helperEmail: helper.email,
      votes: helper.votes.map(vote => ({
        voteId: vote.id,
        teamId: vote.team.id,
        teamName: vote.team.groupName,
        displayName: vote.team.displayName,
        appName: vote.team.appName,
        createdAt: vote.createdAt
      }))
    }));

    res.json(result);
  } catch (error) {
    console.error('Error en getVotesByHelper:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getVotesByAdmin = async (req, res) => {
  try {
    const admins = await db.Admin.findAll({
      include: [
        {
          model: db.Vote,
          as: 'votes',
          include: [
            {
              model: db.Team,
              as: 'team'
            }
          ]
        }
      ],
      order: [['name', 'ASC']]
    });

    const result = admins.map(admin => ({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      votes: admin.votes.map(vote => ({
        voteId: vote.id,
        teamId: vote.team.id,
        teamName: vote.team.groupName,
        displayName: vote.team.displayName,
        appName: vote.team.appName,
        createdAt: vote.createdAt
      }))
    }));

    res.json(result);
  } catch (error) {
    console.error('Error en getVotesByAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteVote = async (req, res) => {
  try {
    const vote = await db.Vote.findByPk(req.params.voteId);
    if (!vote) {
      return res.status(404).json({ error: 'Voto no encontrado' });
    }
    await vote.destroy();
    res.json({ message: 'Voto eliminado' });
  } catch (error) {
    console.error('Error en deleteVote:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const resetAllVotes = async (req, res) => {
  try {
    const { password } = req.body;
    const adminId = req.user.id; // ID del admin logueado
    
    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida' });
    }
    
    // Verificar la contraseña del admin logueado
    const admin = await db.Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    // Contar votos antes de eliminar para reportar cuántos se eliminaron
    const voteCountBefore = await db.Vote.count();
    
    // Eliminar todos los votos usando una consulta SQL directa
    // En PostgreSQL, necesitamos usar RETURNING o contar antes
    await db.sequelize.query('DELETE FROM votes');
    
    res.json({ 
      message: 'Todos los votos han sido eliminados',
      deletedCount: voteCountBefore
    });
  } catch (error) {
    console.error('Error en resetAllVotes:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getHelpers,
  createHelper,
  updateHelper,
  deleteHelper,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  verifyAdminPassword,
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getVotesSummary,
  getVotesByStudent,
  getVotesByHelper,
  getVotesByAdmin,
  deleteVote,
  resetAllVotes,
  getMe,
  updateMe
};

