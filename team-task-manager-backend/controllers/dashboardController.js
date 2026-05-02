const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * @desc    Get dashboard statistics for a specific project
 * @route   GET /api/dashboard/:projectId
 * @access  Private (project member)
 */
const getDashboard = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and user is a member
    const project = await Project.findById(projectId).populate('members.user', 'name email');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const now = new Date();

    // --- 1. Total tasks ---
    const totalTasks = await Task.countDocuments({ project: projectId });

    // --- 2. Tasks grouped by status ---
    const tasksByStatus = await Task.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Convert to a clean object: { "To Do": 5, "In Progress": 3, "Done": 2 }
    const statusMap = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
    tasksByStatus.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    // --- 3. Tasks per assigned user ---
    const tasksPerUser = await Task.aggregate([
      { $match: { project: project._id, assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$userInfo.name',
          email: '$userInfo.email',
        },
      },
    ]);

    // --- 4. Overdue tasks (dueDate in the past and not Done) ---
    const overdueTasks = await Task.find({
      project: projectId,
      dueDate: { $lt: now },
      status: { $ne: 'Done' },
    })
      .populate('assignedTo', 'name email')
      .select('title dueDate status priority assignedTo');

    res.status(200).json({
      success: true,
      dashboard: {
        projectName: project.name,
        totalTasks,
        tasksByStatus: statusMap,
        tasksPerUser,
        overdueTasksCount: overdueTasks.length,
        overdueTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard summary for all projects the user belongs to
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
const getGlobalSummary = async (req, res, next) => {
  try {
    // Find all projects the user is a member of
    const projects = await Project.find({ 'members.user': req.user._id }).select('_id name');
    const projectIds = projects.map((p) => p._id);

    const now = new Date();

    const totalTasks       = await Task.countDocuments({ project: { $in: projectIds } });
    const myAssignedTasks  = await Task.countDocuments({ project: { $in: projectIds }, assignedTo: req.user._id });
    const overdueTasks     = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: now },
      status: { $ne: 'Done' },
    });

    const tasksByStatus = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
    tasksByStatus.forEach((s) => { statusMap[s._id] = s.count; });

    res.status(200).json({
      success: true,
      summary: {
        totalProjects: projects.length,
        totalTasks,
        myAssignedTasks,
        overdueTasks,
        tasksByStatus: statusMap,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getGlobalSummary };
