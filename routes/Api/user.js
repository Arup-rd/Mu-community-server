const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bycript = require("bcryptjs");
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys')
const passport = require('passport')

//Load Input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

//load user model
const User = require("../../models/user");

//@route   Get api/users/test
//@desc    Test users route
//@access  public

router.get("/test", (req, res) =>
  res.json({
    msg: "user works"
  })
);

//@route   Post api/users/register
//@desc    Register users route
//@access  public

router.post("/register", (req, res) => {

  const {
    errors,
    isValid
  } = validateRegisterInput(req.body)

  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      errors.email = 'Email already exists'
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "400", //size
        r: "pg", //rating
        d: "mn" //default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar
      });

      bycript.genSalt(10, (err, salt) => {
        bycript.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route   Post api/users/login
//@desc    Login user / Returning JWT Token
//@access  public

router.post("/login", (req, res) => {

  const {
    errors,
    isValid
  } = validateLoginInput(req.body)

  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({
    email
  }).then(user => {
    //check for user
    if (!user) {
      errors.email = 'User not found'
      return res.status(400).json(errors);
    }

    //check password
    bycript.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //user Matched
        //create JWT payload
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        }

        //Sign token
        jwt.sign(payload,
          keys.secretOrKey, {
            expiresIn: 3600
          },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token
            })
          })

      } else {
        errors.password = 'Incorrect Password'
        return res.status(400).json(errors);
      }
    });
  });
});

//@route   Get api/users/current
//@desc    Return current user
//@access  private

router.get(
  '/current',
  passport.authenticate('jwt', {
    session: false
  }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    })
  })

module.exports = router;