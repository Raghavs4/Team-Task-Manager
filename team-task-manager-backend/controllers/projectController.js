const Project = require('../models/Project');

/**
 * @desc    Create a new project (creator becomes Admin)
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required.' });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      // Creator is automatically added as Admin member
      members: [{ user: req.user._id, role: 'Admin' }],
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects the logged-in user is a member of
 * @route   GET /api/projects
 * @access  Private
 */
const getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id,
    })
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email role');

    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single project by ID
 * @route   GET /api/projects/:id
 * @access  Private (must be a member)
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check if the requesting user is a member
    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this project.' });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a member to a project
 * @route   POST /api/projects/:id/members
 * @access  Private (Admin of the project only)
 */
const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Only project Admins can add members
    const requester = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!requester || requester.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only project Admins can add members.' });
    }

    // Prevent duplicate members
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userId
    );
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this project.' });
    }

    project.members.push({ user: userId, role: role || 'Member' });
    await project.save();

    res.status(200).json({ success: true, message: 'Member added successfully.', project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a member from a project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private (Admin of the project only)
 */
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Only project Admins can remove members
    const requester = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!requester || requester.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only project Admins can remove members.' });
    }

    // Cannot remove the project creator
    if (project.createdBy.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project creator.' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await project.save();

    res.status(200).json({ success: true, message: 'Member removed successfully.', project });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  addMember,
  removeMember,
};
