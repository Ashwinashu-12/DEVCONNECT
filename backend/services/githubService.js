import axios from 'axios';

/**
 * Service to interact with GitHub API
 */
export const fetchGithubProfile = async (username) => {
    try {
        const config = {
            headers: {}
        };

        if (process.env.GITHUB_TOKEN) {
            config.headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
        }

        // Fetch User Profile
        const userRes = await axios.get(`https://api.github.com/users/${username}`, config);

        // Fetch User Repos (Latest 6, sorted by stars)
        const reposRes = await axios.get(
            `https://api.github.com/users/${username}/repos?per_page=6&sort=stargazers_count&direction=desc`,
            config
        );

        return {
            profile: {
                avatar_url: userRes.data.avatar_url,
                bio: userRes.data.bio,
                followers: userRes.data.followers,
                following: userRes.data.following,
                public_repos: userRes.data.public_repos,
                html_url: userRes.data.html_url,
                name: userRes.data.name || username
            },
            repos: reposRes.data.map(repo => ({
                id: repo.id,
                name: repo.name,
                description: repo.description,
                stars: repo.stargazers_count,
                language: repo.language,
                url: repo.html_url
            }))
        };
    } catch (error) {
        console.error('GitHub Service Error:', error.message);
        if (error.response && error.response.status === 404) {
            throw new Error('GitHub user not found');
        }
        throw new Error('Failed to fetch GitHub data');
    }
};
