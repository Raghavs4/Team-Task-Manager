const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * Helper: Check if the user is a member of a project.
 * Returns the member object or null.
 */
const getProjectMember = (project, userId) =>
  project.members.find((m) => m.user.toString() === userId.toString());

/**
 * @desc    Create a new task in a project
 * @route   POST /api/tasks
 * @access  Private (project member)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, priority } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Title and projectId are required.' });
    }

    // Verify project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (!getProjectMember(project, req.user._id)) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
    }

    // If assignedTo is given, verify they are also a project member
    if (assignedTo) {
      const assignedMember = getProjectMember(project, assignedTo);
      if (!assignedMember) {
        return res.status(400).json({ success: false, message: 'The assigned user is not a member of this project.' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      priority: priority || 'Medium',
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks for a specific project
 * @route   GET /api/tasks/project/:projectId
 * @access  Private (project member)
 */
const getTasksByProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (!getProjectMember(project, req.user._id)) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks assigned to the logged-in user
 * @route   GET /api/tasks/my-tasks
 * @access  Private
 */
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 }); // Sort by due date ascending (soonest first)

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private (project member)
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['To Do', 'In Progress', 'Done'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Verify user is a member of the project this task belongs to
    const project = await Project.findById(task.project);
    if (!getProjectMember(project, req.user._id)) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ success: true, message: 'Task status updated.', task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task (title, description, assignedTo, dueDate, priority)
 * @route   PUT /api/tasks/:id
 * @access  Private (project Admin or task creator)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);
    const member = getProjectMember(project, req.user._id);

    if (!member) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
    }

    // Only project Admin or the task creator can update it
    const isAdmin = member.role === 'Admin';
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ success: false, message: 'Only project Admins or the task creator can update this task.' });
    }

    const { title, description, assignedTo, dueDate, priority } = req.body;

    if (title)       task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate)     task.dueDate = dueDate;
    if (priority)    task.priority = priority;
    if (assignedTo !== undefined) {
      if (assignedTo && !getProjectMember(project, assignedTo)) {
        return res.status(400).json({ success: false, message: 'Assigned user is not a project member.' });
      }
      task.assignedTo = assignedTo || null;
    }

    await task.save();

    res.status(200).json({ success: true, message: 'Task updated.', task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private (project Admin or task creator)
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);
    const member = getProjectMember(project, req.user._id);

    if (!member) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
    }

    const isAdmin = member.role === 'Admin';
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ success: false, message: 'Only project Admins or the task creator can delete this task.' });
    }

    await task.deleteOne();

    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getMyTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
