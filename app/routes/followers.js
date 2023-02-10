const express = require("express");
const router = express.Router();
const db = require("../db.js");
const { check, validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

router.get(
  "/:id",
  [check("id", "Invalid user ID").isMongoId()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send("Invalid user ID");
    }
    const mongo = db.getDb();
    const followers = await mongo
      .collection("followers")
      .find({ followedUser: new ObjectId(req.params.id) })
      .toArray();
    res.json(followers);
  }
);

router.post(
  "/:id",
  [check("id", "Invalid user ID").isMongoId()],
  async (req, res) => {
    if (!req.isAuthenticated) {
      return res.status(401).send("Unauthorized");
    }
    const mongo = db.getDb();
    const existingFollow = await mongo.collection("followers").findOne({
      followedUser: new ObjectId(req.params.id),
      followerId: new ObjectId(req.id),
    });
    if (existingFollow) {
      return res.status(400).send("Follow already exists");
    }
    await mongo.collection("followers").insertOne(
      {
        followedUser: new ObjectId(req.params.id),
        followerId: new ObjectId(req.id),
      },
      (err) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send("Follow added successfully");
        }
      }
    );
  }
);

// Rimuovere un follower:
router.delete(
  "/:id",
  [check("id", "Invalid user ID").isMongoId()],
  async (req, res) => {
    if (!req.isAuthenticated) {
      return res.status(401).send("Unauthorized");
    }
    const mongo = db.getDb();
    const existingFollow = await mongo.collection("followers").findOne({
      followedUser: new ObjectId(req.params.id),
      followerId: new ObjectId(req.id),
    });
    if (!existingFollow) {
      return res.status(400).send("Follow does not exist");
    }
    await mongo.collection("followers").deleteOne(
      {
        followedUser: new ObjectId(req.params.id),
        followerId: new ObjectId(req.id),
      },
      (err) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send("Follow removed successfully");
        }
      }
    );
  }
);

module.exports = router;
