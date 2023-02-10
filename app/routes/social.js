const express = require("express");
const router = express.Router();
const db = require("../db.js");
const { check, validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

// Visualizzazione informazione dell’utente con ID id
router.get(
  "/users/:id",
  [check("id", "Invalid user ID").isMongoId()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const mongo = db.getDb();
    try {
      const user = await mongo
        .collection("users")
        .findOne({ _id: ObjectId(req.params.id) });
      if (!user) {
        res.status(404).send("User not found");
      } else {
        const followers = await mongo
          .collection("followers")
          .find({ followedUser: ObjectId(req.params.id) })
          .toArray();

        res.json({
          username: user.username,
          name: user.name,
          surname: user.surname,
          bio: user.bio,
          followers: followers,
          followersCount: followers.length,
        });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

// Elenco degli ultimi messaggi degli utenti seguiti
router.get("/feed", async (req, res) => {
  if (!req.isAuthenticated) {
    return res.status(401).send("Unauthorized");
  }

  const mongo = db.getDb();
  const followers = await mongo
    .collection("followers")
    .find({ followerId: new ObjectId(req.id) })
    .toArray();
  const followedUsers = followers.map((f) => f.followedUser);
  const messages = await mongo
    .collection("messages")
    .aggregate([
      {
        $match: {
          userId: { $in: [...followedUsers, new ObjectId(req.id)] },
        },
      },
      {
        $sort: { date: 1 },
      },
      {
        $group: {
          _id: "$userId",
          lastMessage: { $last: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "lastMessage._id",
          foreignField: "messageId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "likes.userId",
          foreignField: "_id",
          as: "likedByUsers",
        },
      },
      {
        $project: {
          _id: "$lastMessage._id",
          text: "$lastMessage.text",
          date: "$lastMessage.date",
          user: {
            $arrayElemAt: [
              {
                $map: {
                  input: "$user",
                  as: "u",
                  in: {
                    _id: "$$u._id",
                    username: "$$u.username",
                    name: "$$u.name",
                    surname: "$$u.surname",
                  },
                },
              },
              0,
            ],
          },
          likesCount: { $size: "$likes" },
          likedBy: {
            $map: {
              input: "$likedByUsers",
              as: "user",
              in: {
                name: "$$user.name",
                surname: "$$user.surname",
                _id: "$$user._id",
              },
            },
          },
        },
      },
      {
        $sort: { date: -1 },
      },
    ])
    .toArray();
  res.json(messages);
});

// Cerca l’utente che matcha la stringa query
router.get("/search", [check("q").trim().isString()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send("Invalid query");
  }
  const mongo = db.getDb();
  const users = await mongo
    .collection("users")
    .aggregate([
      {
        $match: {
          $or: [
            { name: new RegExp(req.query.q, "i") },
            { surname: new RegExp(req.query.q, "i") },
          ],
        },
      },
      {
        $sort: { name: 1 },
      },
    ])
    .toArray();
  res.json(users);
});

// Se autenticato, restituisce le informazioni sull’utente
router.get("/whoami", async (req, res) => {
  if (req.isAuthenticated) {
    const mongo = db.getDb();
    const user = await mongo
      .collection("users")
      .findOne({ _id: new ObjectId(req.id) });
    if (user) {
      res.json({
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          surname: user.surname,
          bio: user.bio,
        },
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
});

// Global feed
router.get(
  "/global-feed/:offset",
  [check("offset", "Invalid offset").isInt()],
  async (req, res) => {
    const mongo = db.getDb();
    const offset = parseInt(req.params.offset, 10);
    try {
      const messages = await mongo
        .collection("messages")
        .aggregate([
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $sort: {
              date: -1,
            },
          },
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "messageId",
              as: "likes",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "likes.userId",
              foreignField: "_id",
              as: "likedByUsers",
            },
          },
          {
            $project: {
              _id: 1,
              text: 1,
              date: 1,
              user: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: "$user",
                      as: "u",
                      in: {
                        _id: "$$u._id",
                        username: "$$u.username",
                        name: "$$u.name",
                        surname: "$$u.surname",
                      },
                    },
                  },
                  0,
                ],
              },
              likesCount: { $size: "$likes" },
              likedBy: {
                $map: {
                  input: "$likedByUsers",
                  as: "user",
                  in: { _id: "$$user._id", name: "$$user.name" },
                },
              },
            },
          },
          {
            $skip: offset,
          },
          {
            $limit: 10,
          },
        ])
        .toArray();
      res.json(messages);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

// Ottengo i miei follow
router.get("/my-follows", async (req, res) => {
  if (!req.isAuthenticated) return res.status(401).send("Unauthorized");
  const mongo = db.getDb();
  const follows = await mongo
    .collection("followers")
    .find({ followerId: new ObjectId(req.id) })
    .toArray();
  res.json(follows);
});

module.exports = router;
