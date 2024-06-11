const jwt = require("jsonwebtoken");
const { promisify } = require("util");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth2");
const passport = require("passport");

exports.googleLogin = passport.authenticate("google", { scope: ["email"] });
module.exports.configGoogle = () =>{
    passport.use(
      new GoogleStrategy(
        {
              clientID: process.env.GOOGLEID,
          clientSecret: process.env.GOOGLESECRET,
          callbackURL: "https://p2-31261566.onrender.com/google/callback",
          passReqToCallback: true
        },
        function (request, accessToken, refreshToken, profile, cb) {
            cb(null,profile)
        } 
      )
    );
  }


exports.authContact = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const token = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWTSECRET);
            if (token) {
                return next();
            }
            req.user = process.env.ID;
        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        res.redirect("/login");
    }
};


exports.authLogin = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const token = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWTSECRET);
            if (token) {
                res.redirect('/contactos')
            }
            req.user = process.env.ID;
        } catch (error) {
            console.log(error);
            res.redirect('/contactos')
        }
    } else {
        return next()
    }
};








exports.logout = (req, res) => {
    res.clearCookie("jwt");
    return res.redirect("/login");
};
