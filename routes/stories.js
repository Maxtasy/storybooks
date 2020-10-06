const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

// @desc  Show Add Page
// @route GET /stories/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

// @desc  Process Add Form
// @route POST /stories
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc  Show All Stories
// @route GET /stories
router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();

    res.render("stories/index", {
      stories: stories
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc  Show A Story
// @route GET /stories/:id
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate("user")
      .lean();

    res.render("stories/show", {
      story: story
    });
  } catch (err) {
    console.error(err);
    res.render("error/404");
  }
});

// @desc  Show All Stories of User
// @route GET /stories/user/:id
router.get("/user/:id", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.id,
      status: "public"
    })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();

    res.render("stories/index", {
      stories: stories
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc  Edit Story Page
// @route GET /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).lean();

    if (!story) {
      res.render("error/404");
    } else if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", {
        story: story
      });
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc  Process Edit Form
// @route PUT /stories/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      res.render("error/404"); 
    } else if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findOneAndUpdate(
        { _id: req.params.id }, 
        req.body,
        { new: true, runValidators: true }
      );
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc  Delete Story
// @route DELETE /stories/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).lean();

    if (!story) {
      res.render("error/404");
    } else if (story.user != req.user.id) {
      res.redirect("/dashboard");
    } else {
      await Story.remove({ _id: req.params.id });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;