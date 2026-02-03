import { fetchGithubProfile } from '../services/githubService.js';

export const getGithubData = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ message: 'GitHub username is required' });
        }

        const data = await fetchGithubProfile(username);
        res.json(data);
    } catch (error) {
        const status = error.message === 'GitHub user not found' ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};
