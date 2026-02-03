import Project from '../models/Project.js';
import { logActivity } from '../services/activityService.js';

export const createProject = async (req, res) => {
    try {
        const { title, description, techStack, liveUrl, githubUrl } = req.body;
        const userId = req.userId;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const project = await Project.create({
            userId,
            title,
            description,
            techUsed: techStack || [],
            demoUrl: liveUrl || '',
            repoUrl: githubUrl || ''
        });

        // Log Activity
        logActivity({
            user: userId,
            type: 'project',
            projectId: project._id,
            text: `released a new project: ${title}`
        });

        res.status(201).json({
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getProjectsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const userProjects = await Project.find({ userId }).sort({ createdAt: -1 });

        res.json(userProjects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { title, description, techStack, liveUrl, githubUrl } = req.body;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check ownership
        if (project.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    description,
                    techUsed: techStack,
                    demoUrl: liveUrl,
                    repoUrl: githubUrl,
                    updatedAt: Date.now()
                }
            },
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Project updated successfully',
            project: updatedProject
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Project.findByIdAndDelete(id);

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
