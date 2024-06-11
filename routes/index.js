var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
require('dotenv').config()

const ContactosController = require('../controllers/ContactosController');
const ControllerContact = new ContactosController();
const auth = require('../controllers/auth');

router.get("/google", auth.googleLogin);
router.get("/google/callback",
  passport.authenticate("google", {
    //Si falla la authenticacion se redirige al login:
    failureRedirect: "/login",
	failureFlash: true,
  }),
  async (req, res) => {
    const id = process.env.ID;
    const token = jwt.sign({ id: id }, process.env.JWTSECRET);
    res.cookie("jwt", token);
    res.redirect("/contactos");
  }
  /**/ 
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

auth.configGoogle();

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express',
    GKEYPUBLIC: process.env.GKEYPUBLIC
  });
});

router.post('/enviar', (req, res) =>
  ControllerContact.save(req, res)
);



router.post('/login',(req,res) =>
  ControllerContact.loginRead(req,res)
);

router.get('/login',auth.authLogin,(req,res,next) => {
  res.render('login');
});


router.get('/contactos',auth.authContact,(req,res) => {
  ControllerContact.contactosRead(req,res)
})

router.get('/logout',(req,res) => {
  auth.logout(req,res)
})

module.exports = router;
