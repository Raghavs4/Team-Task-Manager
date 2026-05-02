const express = require('express');
const {
  createTask,
  getTasksByProject,
  getMyTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// POST /api/tasks               - Create a task
router.post('/', createTask);

// GET /api/tasks/my-tasks       - Get tasks assigned to logged-in user
router.get('/my-tasks', getMyTasks);

// GET /api/tasks/project/:projectId  - Get all tasks in a project
router.get('/project/:projectId', getTasksByProject);

// PUT    /api/tasks/:id          - Update full task details
// DELETE /api/tasks/:id          - Delete a task
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

// PATCH /api/tasks/:id/status   - Update task status only
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
