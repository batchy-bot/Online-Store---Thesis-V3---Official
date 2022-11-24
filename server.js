const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const UserModel = require("./models/User");
const onlineURI =
  "mongodb+srv://batchy_bot:Tilapia-626@cluster0.kqimzoq.mongodb.net/?retryWrites=true&w=majority";
const localURI = "mongodb://localhost:27017/sessions";

const mongoURI = localURI;

/** START OF MIDDLEWARE SECTION */

const { MongoClient, ServerApiVersion } = require("mongodb");
const { request } = require("express");
/*
const uri = "mongodb+srv://batchy_bot:Tilapia-626@cluster0.kqimzoq.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
*/

mongoose.connect(mongoURI).then((res) => console.log("MongoDB Connected"));

const store = new MongoDBSession({
  uri: mongoURI,
  collection: "mySessions",
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(
  cors({
    origin: ["https://localhost:3000"],
  })
);
app.use(
  session({
    secret: "key that will sign the cookie",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

/** END OF MIDDLEWARE SECTION */

// check if user is authenticated
const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    if (req.session.userType == 'customer'){
      res.render("customer");
    }else if (req.session.userType  == 'seller'){
      res.render("seller");
    }
  } else {
    res.redirect("/login");
  }
};


// POST: LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.redirect("/login");
  } else {
    req.session.isAuth = true;
    req.session.userType = user.usertype;
    req.session.userID = user._id;
    isAuth(req, res)
  }
});

// GET: SELLER PAGE
app.get("/seller", isAuth, (req, res) => {
  res.render("seller");
});

// GET: CUSTOMER PAGE
app.get("/customer", isAuth,(req, res) => {
  res.render("customer");
});

// GET: LANDING PAGE
app.get("/", (req, res) => {
  res.render("landing");
});

// GET: LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login");
});



// GET: REGISTER PAGE
app.get("/register", (req, res) => {
  res.render("register");
});

// POST: REGISTER
app.post("/register", async (req, res) => {
  const { username, email, password, usertype } = req.body;
  let user = await UserModel.findOne({ email });

  if (user) {
    return res.redirect("/register");
  }

  const hashedPsw = await bcrypt.hash(password, 12);

  user = new UserModel({
    username,
    email,
    usertype,
    password: hashedPsw,
    cart: [],
  });

  await user.save();

  res.redirect("/login");
});

/** LOGOUT */
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
});

app.listen(3000, console.log("Server Running on http://localhost:3000"));
