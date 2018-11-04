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

router.delete(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        post.remove().then(() =>
          res.json({
            success: true
          })
        );
      })
      .catch(
        res.status(401).json({
          postnotfound: "No post found"
        })
      );
  }
);

// @route   Post api/posts/like/:id
// @desc    Like post
// @access  Private

router.post(
  "/like/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        //check if any user liked before
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
          .length > 0
        ) {
          return res.status(400).json({
            alreadyLiked: "Post is already liked by the user"
          });
        }
        post.likes.unshift({
          user: req.user.id
        });

        //save in the database
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(400).json({
        postnotfound: "post not found"
      }));
  }
);

// @route   Post api/posts/unlike/:id
// @desc    unlike post
// @access  Private

router.post(
  "/unlike/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        //check if any user liked it before
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
          .length === 0
        ) {
          return res
            .status(400)
            .json({
              notLiked: "This post not liked by the user yet"
            });
        }
        //Get remove index
        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        //Splice item
        post.likes.splice(removeIndex, 1);

        //save in the database
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(400).json({
        postnotfound: "post not found"
      }));
  }
);

// @route   Post api/posts/comment/:id
// @desc    comment post
// @access  Private

router.post('/comment/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Post.findById(req.params.id).then(post => {
    const {
      errors,
      isValid
    } = validatePostInput(req.body);
    //check validation
    if (!isValid) {
      res.status(400).json(errors);
    }
    const newComment = {
      user: req.user.id,
      text: req.body.text,
      name: req.user.name,
      avatar: req.user.avatar
    }
    //add new post to the comment array
    post.comments.unshift(newComment);

    //save to the database
    post.save().then(post => res.json(post))

  }).catch(err => res.status(400).json({
    notFound: ' post not found '
  }))
})

// @route   Delete api/posts/comment/:id/:comment_id
// @desc    Delete a comment
// @access  Private

router.post('/comment/:id/:comment_id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Post.findById(req.params.id).then(post => {

    //find if comment exits
    if (post.comments.filter(item => item._id.toString() === req.params.comment_id).length === 0) {
      return res.status(400).json({
        commentnotExist: 'Comment does not exist'
      })
    }
    //Get remove index
    const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id)

    //splice from the array
    post.comments.splice(removeIndex, 1)

    //save in database
    post.save().then(post => res.json(post))

  }).catch(err => res.status(400).json({
    notFound: ' post not found '
  }))
})


module.exports = router;