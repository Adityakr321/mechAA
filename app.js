const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config({ path: __dirname + '/.env' });


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); // Set EJS as the view engine
app.use(express.static("public")); // Serve static files from the "public" folder

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => {
        console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Define User schema and model
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  password: String, // Added password field
});

const User = mongoose.model("User", userSchema);

// Define Mechanic schema and model
const mechanicSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
});

const Mechanic = mongoose.model("Mechanic", mechanicSchema);

// Route to display signup form
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Signup route to add a new user
app.post("/signup", (req, res) => {
  const { username, email, phone, password } = req.body;

  // Check if email is already registered
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        // If user already exists, redirect to login
        return res.redirect("/login");
      }

      // Create a new user
      const newUser = new User({
        username,
        email,
        phone,
        password, // Save password directly 
      });

      // Save user to the database
      return newUser.save();
    })
    .then(() => {
      // Redirect to login page upon successful signup
      res.redirect("/login");
    })
    .catch((error) => {
      console.error("Error during signup:", error);
      res.status(500).send("An error occurred during signup.");
    });
});


// Route to display mechanics signup form
app.get("/signup-mechanic", (req, res) => {
    res.render("signup-mechanic"); // Render the mechanics signup page
  });
  
  // Mechanics signup route to add a new mechanic
  app.post("/signup-mechanic", (req, res) => {
    const { name, address, phone } = req.body;
  
    // Create a new mechanic
    const newMechanic = new Mechanic({
      name,
      address,
      phone,
    });
  
    // Save mechanic to the database
    newMechanic.save()
      .then(() => {
        // Redirect to mechanics page upon successful signup
        res.redirect("/mechanics");
      })
      .catch((error) => {
        console.error("Error during mechanic signup:", error);
        res.status(500).send("An error occurred during mechanic signup.");
      });
  });
  
  

// Login route to display login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Handle login form submission
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists in the database based on username and password
  User.findOne({ username: username, password: password }) // Match both username and password
    .then((user) => {
      if (user) {
        // User found, redirect to mechanics page
        res.redirect("/mechanics"); // Adjust the path to your mechanics page
      } else {
        // User not found, render login page with an error message
        res.render("login", { errorMessage: 'Invalid username or password' });
      }
    })
    .catch((err) => {
      console.error(err);
      res.render("login", { errorMessage: 'An error occurred. Please try again.' });
    });
});

// Route for mechanics search (GET)
app.get("/mechanics", (req, res) => {
  // Fetch all mechanics from the database
  Mechanic.find()
    .then((mechanics) => {
      res.render("mechanics", { mechanics }); // Pass mechanics data to the view
    })
    .catch((error) => {
      console.error("Error fetching mechanics:", error);
      res.status(500).send("An error occurred while fetching mechanics.");
    });
});

// Route to add a new mechanic
app.get("/", function(req, res) {
  res.render("new");
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
