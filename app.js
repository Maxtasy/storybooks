const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const expressHandlebars = require("express-handlebars");
const methodOverride = require("method-override");
const passport = require("passport");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo")(expressSession);
const connectDB = require("./config/db");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const storiesRouter = require("./routes/stories");

// Load Config
dotenv.config({ path: "./config/config.env" });

// Passport Config
require("./config/passport")(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method Override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === "object" && "_method" in req.body) {
    // Look in urlencoded POST bodies and delete it
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Handlebars Helpers
const { formatDate, truncate, stripTags, editIcon, select } = require("./helpers/hbs");

// Handlebars
app.engine(".hbs", expressHandlebars({
  helpers: {
    formatDate,
    truncate,
    stripTags,
    editIcon,
    select
  },
  extname: ".hbs",
  defaultLayout: "main"
}));

// Express Session
app.use(expressSession({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set Global Variable
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/stories", storiesRouter);

app.set("view engine", ".hbs");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});