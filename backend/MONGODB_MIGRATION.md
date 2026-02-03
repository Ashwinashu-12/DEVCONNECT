# MongoDB Migration Guide

## Current Setup
The backend currently uses in-memory arrays in `data/mockData.js` to simulate a database. This is perfect for development and testing without requiring a database setup.

## How to Connect MongoDB Later

### Step 1: Install Mongoose
```bash
npm install mongoose
```

### Step 2: Create Database Connection
Create `config/database.js`:

```javascript
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
```

### Step 3: Create Mongoose Models
Create `models/User.js`:

```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String },
  techStack: [{ type: String }],
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
```

Create `models/Post.js`:

```javascript
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema]
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
```

Create `models/Project.js`:

```javascript
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  liveUrl: { type: String },
  githubUrl: { type: String }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
```

### Step 4: Update Controllers
Replace array operations with Mongoose queries. Example for `authController.js`:

```javascript
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, bio, techStack, socialLinks } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      bio,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      techStack,
      socialLinks
    });

    // Generate token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Remove password from response
    const userObject = newUser.toObject();
    delete userObject.password;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userObject
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

### Step 5: Update server.js
Add database connection:

```javascript
import { connectDB } from './config/database.js';

// Connect to MongoDB
connectDB();

// Rest of your server code...
```

### Step 6: Update .env
Add MongoDB connection string:

```
MONGODB_URI=mongodb://localhost:27017/devconnect
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devconnect
```

### Migration Checklist
- [ ] Install mongoose
- [ ] Create database.js config
- [ ] Create Mongoose models (User, Post, Project)
- [ ] Update all controllers to use Mongoose instead of arrays
- [ ] Update server.js to connect to MongoDB
- [ ] Add MONGODB_URI to .env
- [ ] Test all endpoints
- [ ] Seed initial data if needed

## Benefits of Current Mock Setup
1. ✅ No database installation required
2. ✅ Instant startup
3. ✅ Easy testing and development
4. ✅ Same API structure as MongoDB
5. ✅ Easy to migrate later

## Data Persistence Note
Current mock data resets on server restart. For persistent mock data during development, you could:
1. Write data to a JSON file
2. Use a lightweight database like SQLite
3. Or just migrate to MongoDB when ready for production
