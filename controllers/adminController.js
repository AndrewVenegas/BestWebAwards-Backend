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
    const passwordHash = await bcrypt.hash(password, 10);
    
    const helper = await db.Helper.create({
      name,
      email,
      passwordHash
    });
    
    res.status(201).json(helper);
  } catch (error) {
    console.error('Error en createHelper:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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
    const passwordHash = await bcrypt.hash(password, 10);
    
    const admin = await db.Admin.create({
      name,
      email,
      passwordHash,
      role: 'admin'
    });
    
    res.status(201).json(admin);
  } catch (error) {
    console.error('Error en createAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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

const deleteAdmin = async (req, res) => {
  try {
    const admin = await db.Admin.findByPk(req.params.id);
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
    const { groupName, displayName, appName, helperId, participates } = req.body;
    
    const team = await db.Team.create({
      groupName,
      displayName,
      appName,
      helperId: helperId || null,
      participates: participates || false
    });
    
    res.status(201).json(team);
  } catch (error) {
    console.error('Error en createTeam:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { groupName, displayName, appName, helperId, participates, deployUrl, videoUrl, screenshotUrl } = req.body;
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
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getVotesSummary,
  getVotesByStudent,
  deleteVote
};

