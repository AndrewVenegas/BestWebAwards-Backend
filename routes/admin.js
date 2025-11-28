const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const configController = require('../controllers/configController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Students CRUD
router.get('/students', authenticateToken, requireRole('admin'), adminController.getStudents);
router.get('/students/:id', authenticateToken, requireRole('admin'), adminController.getStudent);
router.post('/students', authenticateToken, requireRole('admin'), adminController.createStudent);
router.put('/students/:id', authenticateToken, requireRole('admin'), adminController.updateStudent);
router.delete('/students/:id', authenticateToken, requireRole('admin'), adminController.deleteStudent);

// Helpers CRUD
router.get('/helpers', authenticateToken, requireRole('admin'), adminController.getHelpers);
router.post('/helpers', authenticateToken, requireRole('admin'), adminController.createHelper);
router.put('/helpers/:id', authenticateToken, requireRole('admin'), adminController.updateHelper);
router.delete('/helpers/:id', authenticateToken, requireRole('admin'), adminController.deleteHelper);

// Admins CRUD
router.get('/admins/me', authenticateToken, requireRole('admin'), adminController.getMe);
router.put('/admins/me', authenticateToken, requireRole('admin'), adminController.updateMe);
router.get('/admins', authenticateToken, requireRole('admin'), adminController.getAdmins);
router.post('/admins', authenticateToken, requireRole('admin'), adminController.createAdmin);
router.put('/admins/:id', authenticateToken, requireRole('admin'), adminController.updateAdmin);
router.post('/admins/verify-password', authenticateToken, requireRole('admin'), adminController.verifyAdminPassword);
router.delete('/admins/:id', authenticateToken, requireRole('admin'), adminController.deleteAdmin);

// Teams CRUD
router.get('/teams', authenticateToken, requireRole('admin'), adminController.getTeams);
router.post('/teams', authenticateToken, requireRole('admin'), adminController.createTeam);
router.put('/teams/:id', authenticateToken, requireRole('admin'), adminController.updateTeam);
router.delete('/teams/:id', authenticateToken, requireRole('admin'), adminController.deleteTeam);

// Dashboard
router.get('/votes/summary', authenticateToken, requireRole('admin'), adminController.getVotesSummary);
router.get('/votes/by-student', authenticateToken, requireRole('admin'), adminController.getVotesByStudent);
router.get('/votes/by-helper', authenticateToken, requireRole('admin'), adminController.getVotesByHelper);
router.get('/votes/by-admin', authenticateToken, requireRole('admin'), adminController.getVotesByAdmin);
router.delete('/votes/:voteId', authenticateToken, requireRole('admin'), adminController.deleteVote);

// Config
router.put('/config/voting-deadline', authenticateToken, requireRole('admin'), configController.updateVotingDeadline);
router.post('/config/toggle-paused', authenticateToken, requireRole('admin'), configController.toggleVotingPaused);

module.exports = router;

