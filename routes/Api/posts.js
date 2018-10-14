const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load model
const Post = require("../../models/post");

//Load Profile model
const Profile = require("../../models/profile");

//Load validation
const validatePostInput = require("../../validation/post");

//@route   Get api/posts/test
//@desc    Test posts route
//@access  public

router.get("/test", (req, res) =>
  res.json({
    msg: "posts works"
  })
);

//@route   Get api/posts
//@desc    Get all post
//@access  public

router.get("/", (req, res) => {
  Post.find()
    .sort({
      date: -1
    })
    .then(posts => res.json(posts))
    .catch(err => res.status(404));
});

//@route   Get api/posts/:id
//@desc    Get post by id
//@access  public

router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({
        noPostFound: " No Post Found with that ID"
      })
    );
});

//@route   Post api/posts
//@desc    create post
//@access  private

router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const {
      errors,
      isValid
    } = validatePostInput(req.body);
    //chechk validation
    if (!isValid) {
      res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.body.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private

router.delete('/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      post.remove().then(() => res.json({
        success: true
      }))
    })
})

module.exports = router;