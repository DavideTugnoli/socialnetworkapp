const express = require("express");
const router = express.Router();
const db = require("../db.js");
const { check, validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

// Like ad un messaggio con ID idMessage
router.post("/:idMessage", async (req, res) => {
  if (!req.isAuthenticated) return res.status(401).send("Unauthorized");

  const errors = validationResult(req);
  check(req.params.idMessage, "Invalid message ID").isMongoId();
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const mongo = db.getDb();

  const like = await mongo.collection("likes").findOne({
    userId: new ObjectId(req.id),
    messageId: new ObjectId(req.params.idMessage),
  });
  if (like) return res.status(400).send("User has already liked this message");

  const result = await mongo.collection("likes").insertOne({
    userId: new ObjectId(req.id),
    messageId: new ObjectId(req.params.idMessage),
  });

  res.send("Like added");
});

// Rimozione like al messaggio con ID idMessage
router.delete("/:idMessage", async (req, res) => {
  if (!req.isAuthenticated) return res.status(401).send("Unauthorized");

  const errors = validationResult(req);
  check(req.params.idMessage, "Invalid message ID").isMongoId();
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const mongo = db.getDb();

  const result = await mongo.collection("likes").deleteOne({
    userId: new ObjectId(req.id),
    messageId: new ObjectId(req.params.idMessage),
  });

  if (result.deletedCount === 0) return res.status(404).send("Like not found");

  res.send("Like removed");
});

// Ottenere i like di un messaggio
router.get("/:idMessage", async (req, res) => {
  const errors = validationResult(req);
  check(req.params.idMessage, "Invalid message ID").isMongoId();
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const mongo = db.getDb();

  const likes = await mongo
    .collection("likes")
    .find({ messageId: new ObjectId(req.params.idMessage) })
    .toArray();

  if (!likes || likes.length === 0) {
    return res.json({ numLikes: 0, users: [] });
  }

  const userIds = likes.map((like) => like.userId);
  const users = await mongo
    .collection("users")
    .find({ _id: { $in: userIds } })
    .toArray();

  const mappedUsers = users.map((user) => ({ _id: user._id, name: user.name }));

  res.json({
    numLikes: likes.length,
    users: mappedUsers,
  });
});

module.exports = router;
