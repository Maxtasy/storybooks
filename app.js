const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const expressHandlebars = require("express-handlebars");
const passport = require("passport");
const expressSession = require("express-session");
const connectDB = require("./config/db");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");

// Load Config
dotenv.config({ path: "./config/config.env" });

// Passport Config
require("./config/passport")(passport);

connectDB();

const app = express();

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Handlebars
app.engine(".hbs", expressHandlebars({ 
  extname: ".hbs",
  defaultLayout: "main"
}));

// Express Session
app.use(expressSession({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/auth", authRouter);

app.set("view engine", ".hbs");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});