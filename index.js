const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/register');
const Flight = require("./models/FlightSchema");
const JWT_SECRET = 'hello'; // Your JWT secret key

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // Parse cookies

// Connect to MongoDB
const uri = "mongodb+srv://nitinkaliramna9:nitin123@cluster0.dprqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

const port = 30000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Register route
app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', async (req, res) => {
  console.log(req.body);
    const {
        firstName, lastName, email, phone, dob, username, password, address,
        emergencyContact, passportInfo, travelPreferences, newsletter
    } = req.body;

    try {
        if (!firstName || !lastName || !email || !phone || !username || !password) {
            return res.status(400).json({ error: "missing_field", message: "All required fields must be filled." });
        }

        const [existingEmail, existingPhone, existingUsername] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ phone }),
            User.findOne({ username })
        ]);

        if (existingEmail || existingPhone || existingUsername) {
            return res.status(409).json({
                error: "duplicate", 
                message: existingEmail ? "Email already exists." : existingPhone ? "Phone number already exists." : "Username already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName, lastName, email, phone, dob, username, password: hashedPassword,
            address, emergencyContact, passportInfo, travelPreferences, newsletter
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "Registration successful" });
        console.log("sved in dataBSE");
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: "server", message: "Internal server error" });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

// Middleware to verify token
const verifyLogin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.render('home.ejs',{user:null}); // Render login page if no token
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded user info to req object
        next();
    } catch (error) {
        return res.render('home.ejs',{user:null}); // If the token is invalid or expired, render login page
    }
};
const verifyLoginfree = (req, res, next) => {
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
        req.user = null;  // No token, user is not logged in
        return next();  // Proceed to the next middleware or route
    }

    // Try to verify the token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);  // Verify the token with the secret key
        req.user = decoded;  // Attach the decoded user data to req object
    } catch (error) {
        req.user = null;  // If the token is invalid or expired, set user to null
    }
    
    // Proceed to the next middleware or route
    next();
};




// ?flight fetch data showing
app.post("/book-flight", async (req, res) => {
    const { source, destinations, travelDate } = req.body;
    console.log(req.body);
    const destination = destinations[0]; // Single destination from form
  
    try {
      // Fetch flights matching source, destination, and travelDate
      const matchingFlights = await Flight.find({
        source: source,
        destination: destination,
        availabilityDates: { $elemMatch: { $eq: new Date(travelDate) } },
      });
  
      // Render the flights page with results
      res.render("flights", {
        source,
        destination,
        travelDate,
        flights: matchingFlights,
      });
    } catch (error) {
      console.error("Error fetching flights:", error);
      res.status(500).send("Internal Server Error");
    }
  });


//   handling of booking system

app.get("/book/:flightId", async (req, res) => {
    console.log(req.params.flightId);
    console.log("recieved request");
    try {
      const flight = await Flight.findById(req.params.flightId);
      console.log(flight);
      if (!flight) {
        return res.status(404).send("Flight not found");
      }
      res.render("book", { flight });
    } catch (err) {
      res.status(500).send("Server error");
    }
  });
  
  // Route to handle booking submission
  app.post("/book/:flightId", async (req, res) => {
    const { travelerName, seatCount, classType } = req.body;
  
    try {
      const flight = await Flight.findById(req.params.flightId);
      if (!flight) {
        return res.status(404).send("Flight not found");
      }
  
      // Find the ticket option based on classType
      const ticketOption = flight.ticketOptions.find(
        (option) => option.classType === classType
      );
  
      if (!ticketOption) {
        return res.status(400).send("Invalid class type");
      }
  
      const totalPrice = ticketOption.price * seatCount;
  
      // Simulate successful booking
      res.render("confirmation", {
        flight,
        travelerName,
        seatCount,
        classType,
        totalPrice,
      });
    } catch (err) {
      res.status(500).send("Server error");
    }
  });
// Home route
app.get('/', verifyLogin, (req, res) => {
    // After verifying the login, render the home page
    res.render('home.ejs', { user: req.user });
});

// Logout route
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/home',{user:null});
});
app.get('/login',(req,res)=>{
    console.log("hello");
    res.render('login');
})
app.get('/profile',verifyLogin,async(req,res)=>{
    const user=req.user;
    
   const userdata=await User.find({email:user.email});
   res.render("profile.ejs",{userdata});

})
app.get('/booking',verifyLoginfree,(req,res)=>{

    console.log("booking page accessed");
    res.render('booking.ejs',{user:req.user});
})
app.post('/cookie', async (req, res) => {
  try {
    const { password } = req.body; // Ensure you're extracting 'password' correctly from the request body
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Generate a JWT token
    const token = jwt.sign({ password }, JWT_SECRET, { expiresIn: '1h' });

    // Set the token as a cookie
    res.cookie('authToken', token, { httpOnly: true, secure: true, maxAge: 3600000 });

    // Send the response
    res.status(200).send(`Cookie set, and password hash is: ${hash}`);
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    res.status(500).json({ message: "An error occurred" });
  }
});