const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
dotenv.config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory:", uploadsDir);
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://flavoshare1.onrender.com'],
  credentials: true
}));

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  profileImg: String,
});

const User = mongoose.model("User", userSchema);

// Recipe Schema
const recipeSchema = new mongoose.Schema({
  title: String,
  ingredients: String,
  instructions: String,
  image: String,
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Recipe = mongoose.model("Recipe", recipeSchema);

// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Upload destination:", uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log("Generated filename:", filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log("Received file:", file.originalname, "Type:", file.mimetype);
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    console.log("File rejected: not an allowed image type");
    return cb(new Error('Only image files are allowed!'), false);
  }
  console.log("File accepted");
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to Verify Token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// API Endpoints

// 1. User Registration
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "Registration successful!" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Error during registration" });
  }
});

// 2. User Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ 
      message: "Login successful", 
      token,
      userId: user._id 
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Error during login" });
  }
});

// 3. Upload Recipe
app.post("/recipes", upload.single("image"), async (req, res) => {
  try {
    console.log("Received recipe upload request");
    console.log("Request body:", req.body);
    console.log("File:", req.file);

    const { title, ingredients, instructions } = req.body;

    // Validate required fields
    if (!title || !ingredients || !instructions) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if image was uploaded
    if (!req.file) {
      console.log("No image file received");
      return res.status(400).json({ error: "Image is required" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const fullImageUrl = `${process.env.BASE_URL}${imagePath}`;
    console.log("Image path:", fullImageUrl);

    // Process instructions to preserve numbered steps
    const processedInstructions = instructions
      .split(/\r?\n/)  // Split by newlines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    const recipe = new Recipe({
      title,
      ingredients,
      instructions: processedInstructions,
      image: imagePath,
    });

    const savedRecipe = await recipe.save();
    console.log("Recipe saved successfully:", savedRecipe);

    res.status(201).json({
      ...savedRecipe.toObject(),
      image: fullImageUrl
    });
  } catch (error) {
    console.error("Error saving recipe:", error);
    if (error.message && error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ error: "Only image files (jpg, jpeg, png, gif) are allowed" });
    }
    if (error.message && error.message.includes('File too large')) {
      return res.status(400).json({ error: "Image file size must be less than 5MB" });
    }
    res.status(500).json({ error: "Failed to upload recipe" });
  }
});

// 4. Get All Recipes
app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    const token = req.headers["authorization"];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        console.log("Invalid token in /recipes");
      }
    }

    const recipesWithLikeStatus = recipes.map(recipe => ({
      ...recipe.toObject(),
      isLiked: userId ? recipe.likedBy.includes(userId) : false,
      image: recipe.image.startsWith('http') ? recipe.image : `${process.env.BASE_URL}${recipe.image}`
    }));

    res.status(200).json(recipesWithLikeStatus);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// 5. Like a Recipe
app.post("/api/like-recipe/:id", verifyToken, async (req, res) => {
  try {
    const { userId } = req;
    const recipeId = req.params.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (!recipe.likedBy.includes(userId)) {
      recipe.likedBy.push(userId);
      await recipe.save();
    }

    res.status(200).json({ 
      message: "Recipe liked successfully",
      recipe: {
        ...recipe.toObject(),
        isLiked: true
      }
    });
  } catch (err) {
    console.error("Error liking recipe:", err);
    res.status(500).json({ message: "Error liking recipe" });
  }
});

// 6. Unlike a Recipe
app.post("/api/unlike-recipe/:id", verifyToken, async (req, res) => {
  try {
    const { userId } = req;
    const recipeId = req.params.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const index = recipe.likedBy.indexOf(userId);
    if (index !== -1) {
      recipe.likedBy.splice(index, 1);
      await recipe.save();
    }

    res.status(200).json({ 
      message: "Recipe unliked successfully",
      recipe: {
        ...recipe.toObject(),
        isLiked: false
      }
    });
  } catch (err) {
    console.error("Error unliking recipe:", err);
    res.status(500).json({ message: "Error unliking recipe" });
  }
});

// 7. Get Liked Recipes for Logged-in User
app.get("/api/liked-recipes", verifyToken, async (req, res) => {
  try {
    const { userId } = req;
    const likedRecipes = await Recipe.find({ likedBy: userId });
    res.status(200).json(likedRecipes);
  } catch (err) {
    console.error("Error fetching liked recipes:", err);
    res.status(500).json({ message: "Error fetching liked recipes" });
  }
});

//get-user
app.get("/api/user/get-user", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      name: user.name,
      age: user.age,
      profileImg: user.profileImg,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user details" });
  }
});

// ✅ Update User Settings API
app.post(
  "/api/user/update-settings",
  verifyToken,
  upload.single("profileImg"),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { name, age } = req.body;
      const profileImgPath = req.file ? `/uploads/${req.file.filename}` : null;
      const fullProfileImgUrl = profileImgPath ? `${process.env.BASE_URL}${profileImgPath}` : null;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Update Fields
      user.name = name || user.name;
      user.age = age || user.age;
      if (fullProfileImgUrl) user.profileImg = fullProfileImgUrl;

      await user.save();
      res.status(200).json({ 
        message: "Profile updated successfully", 
        user: {
          ...user.toObject(),
          profileImg: user.profileImg
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
);

// Handle React routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
