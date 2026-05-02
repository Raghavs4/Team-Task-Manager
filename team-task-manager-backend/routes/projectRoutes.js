const express = require('express');
const {
  createProject,
  getMyProjects,
  getProjectById,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All project routes require authentication
router.use(protect);

// GET  /api/projects        - Get all projects for the logged-in user
// POST /api/projects        - Create a new project
router.route('/')
  .get(getMyProjects)
  .post(createProject);

// GET /api/projects/:id     - Get a specific project
router.route('/:id')
  .get(getProjectById);

// POST   /api/projects/:id/members           - Add a member
// DELETE /api/projects/:id/members/:userId   - Remove a member
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
