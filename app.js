const express = require("express");
const cors = require("cors");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const expressLayout = require("express-ejs-layouts");
const fileUpload = require("express-fileupload");
const connectDB = require("./lib/mongodb");

require("dotenv").config();

const app = express();

// Trust proxy for Vercel (required for secure cookies behind proxy)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Passport config
require("./config/passport")(passport);

// Connect to MongoDB (serverless-safe)
let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error("MongoDB connection error:", err);
      return res.status(500).send("Database connection error");
    }
  }
  next();
});

// MIDDLEWARES
app.use(cors());

// Static files - use absolute path for serverless
app.use(express.static(path.join(__dirname, "public")));

// View engine setup with absolute path
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload({}));

// Session configuration with MongoDB store for serverless
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Use MongoDB store for sessions in production
if (process.env.DB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.DB_URI,
    ttl: 24 * 60 * 60, // 24 hours
    autoRemove: "native",
  });
}

app.use(session(sessionConfig));
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(async function (req, res, next) {
  res.locals.siteName = "Elite Trade Capital";
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// ROUTES
app.use("/", require("./routes/index"));
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/user"));
app.use("/admin", require("./routes/admin/index"));
app.use("/admin", require("./routes/admin/auth"));

// 404 handler
app.use("*", (req, res) => {
  try {
    return res.redirect("/");
  } catch (err) {
    return res.redirect("/");
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error on route:", req.originalUrl);
  console.error("Error message:", err.message);
  console.error("Error stack:", err.stack);
  res.status(500).send("Something went wrong!");
});

module.exports = app;
