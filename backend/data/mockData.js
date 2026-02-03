// Mock database using in-memory arrays
// This structure is MongoDB-ready for easy migration later

export let users = [
    {
        _id: '1',
        name: 'Sarah Chen',
        email: 'sarah@devconnect.com',
        password: '$2a$10$X8qJ9Z1YvZ8qJ9Z1YvZ8qO', // hashed: password123
        bio: 'Full-stack developer passionate about React and Node.js. Building the future one commit at a time.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        techStack: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
        socialLinks: {
            github: 'https://github.com/sarahchen',
            linkedin: 'https://linkedin.com/in/sarahchen',
            twitter: 'https://twitter.com/sarahchen'
        },
        followers: ['2', '3'],
        following: ['2'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
    },
    {
        _id: '2',
        name: 'Alex Kumar',
        email: 'alex@devconnect.com',
        password: '$2a$10$X8qJ9Z1YvZ8qJ9Z1YvZ8qO',
        bio: 'AI/ML Engineer | Python enthusiast | Building intelligent systems',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        techStack: ['Python', 'TensorFlow', 'PyTorch', 'Docker', 'Kubernetes'],
        socialLinks: {
            github: 'https://github.com/alexkumar',
            linkedin: 'https://linkedin.com/in/alexkumar'
        },
        followers: ['1', '3'],
        following: ['1', '3'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
    },
    {
        _id: '3',
        name: 'Maya Rodriguez',
        email: 'maya@devconnect.com',
        password: '$2a$10$X8qJ9Z1YvZ8qJ9Z1YvZ8qO',
        bio: 'DevOps Engineer | Cloud Architecture | Automation lover',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
        techStack: ['AWS', 'Terraform', 'Jenkins', 'Docker', 'Python'],
        socialLinks: {
            github: 'https://github.com/mayarodriguez',
            linkedin: 'https://linkedin.com/in/mayarodriguez',
            twitter: 'https://twitter.com/mayarod'
        },
        followers: ['1', '2'],
        following: ['2'],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
    }
];

export let posts = [
    {
        _id: '1',
        userId: '1',
        content: 'Just deployed my first microservices architecture! 🚀 Used Docker, Kubernetes, and Node.js. The learning curve was steep but totally worth it. #DevOps #Microservices',
        likes: ['2', '3'],
        comments: [
            {
                _id: 'c1',
                userId: '2',
                content: 'Awesome work! How did you handle service discovery?',
                createdAt: new Date('2024-02-02T10:30:00')
            }
        ],
        createdAt: new Date('2024-02-02T09:00:00'),
        updatedAt: new Date('2024-02-02T09:00:00')
    },
    {
        _id: '2',
        userId: '2',
        content: 'Working on a new ML model for image classification. Achieved 94% accuracy! 🎯 Using PyTorch and transfer learning. Open to collaboration!',
        likes: ['1', '3'],
        comments: [],
        createdAt: new Date('2024-02-01T14:20:00'),
        updatedAt: new Date('2024-02-01T14:20:00')
    },
    {
        _id: '3',
        userId: '3',
        content: 'Automated our entire CI/CD pipeline today. Deployment time reduced from 45 minutes to 8 minutes! ⚡ #DevOps #Automation',
        likes: ['1'],
        comments: [
            {
                _id: 'c2',
                userId: '1',
                content: 'That\'s incredible! What tools did you use?',
                createdAt: new Date('2024-02-01T16:00:00')
            },
            {
                _id: 'c3',
                userId: '2',
                content: 'Would love to learn more about your setup!',
                createdAt: new Date('2024-02-01T16:30:00')
            }
        ],
        createdAt: new Date('2024-02-01T15:45:00'),
        updatedAt: new Date('2024-02-01T15:45:00')
    }
];

export let projects = [
    {
        _id: '1',
        userId: '1',
        title: 'E-Commerce Platform',
        description: 'Full-stack e-commerce platform with real-time inventory management',
        techStack: ['React', 'Node.js', 'MongoDB', 'Redis', 'Stripe'],
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com/sarahchen/ecommerce',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
    },
    {
        _id: '2',
        userId: '2',
        title: 'Image Recognition API',
        description: 'REST API for image classification using deep learning',
        techStack: ['Python', 'FastAPI', 'TensorFlow', 'Docker'],
        githubUrl: 'https://github.com/alexkumar/image-api',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
    },
    {
        _id: '3',
        userId: '3',
        title: 'Infrastructure as Code',
        description: 'Terraform modules for AWS infrastructure automation',
        techStack: ['Terraform', 'AWS', 'Python', 'Bash'],
        githubUrl: 'https://github.com/mayarodriguez/terraform-aws',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
    }
];

// Helper function to generate unique IDs
export const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
