require("dotenv").config()
const path = require("path")
const express = require("express")
const passport = require("passport")
const session = require("express-session")
const mongoose = require("mongoose")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const { userModel } = require("./db/db.js")

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/oauth_demo")

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
)
app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModel.findOne({ googleId: profile.id })
        if (!user) {
          user = await userModel.create({
            googleId: profile.id,
            fullname: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
            authType: "google",
          })
        }
        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    },
  ),
)

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))

app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
  res.redirect("/welcome.html")
})

app.get("/profile", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" })
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      fullname: req.user.fullname,
      email: req.user.email,
      authType: req.user.authType,
      photo: req.user.photo,
    },
  })
})

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).json({ success: false, message: "Logout failed" })
    }

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      res.json({ success: true, message: "Logged out successfully" })
    } else {
      res.redirect("/")
    }
  })
})

app.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password } = req.body
    const user = await userModel.findOne({ email })
    if (user) {
      res.json({
        success: false,
        message: "User already exist",
      })
      return
    }

    const newUser = await userModel.create({
      fullname,
      email,
      password,
      authType: "local",
    })

    req.login(newUser, (err) => {
      if (err) {
        console.error("Login after signup error:", err)
        return res.status(500).json({ success: false, message: "Signup successful but login failed" })
      }

      res.json({
        success: true,
        message: "User is signed up",
        user: {
          id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
          authType: newUser.authType,
        },
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await userModel.findOne({ email, password })
    if (!user) {
      res.json({
        success: false,
        message: "User not exist",
      })
      return
    }

    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err)
        return res.status(500).json({ success: false, message: "Login failed" })
      }

      res.json({
        success: true,
        message: "User is signed in",
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          authType: user.authType,
        },
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

app.listen(3000, () => {
  console.log(`Server is running at port http://localhost:3000`)
})
