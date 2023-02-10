const express = require("express");
const router = express.Router();
const db = require("../db.js");
const { check, validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

// Elenco dei messaggi dell’utente con ID userID
router.get("/:userId", [check("userId", "Invalid user ID").isMongoId()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  const mongo = db.getDb();
  try {
    const messages = await mongo
      .collection("messages")
      .aggregate([
        { $match: { userId: ObjectId(req.params.userId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            user: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$user",
                    as: "user",
                    cond: { $eq: ["$$user._id", "$userId"] },
                  },
                },
                0,
              ],
            },
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
          $sort: { date: -1 },
        },
        {
          $project: {
            _id: 1,
            text: 1,
            date: 1,
            "user._id": 1,
            "user.username": 1,
            "user.name": 1,
            "user.surname": 1,
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
      ])
      .toArray();
    res.json(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Singolo messaggio dell’utente userID con ID idMsg
router.get(
  "/:userId/:idMsg",
  [check("userId", "Invalid user ID").isMongoId(), check("idMsg", "Invalid message ID").isMongoId()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const mongo = db.getDb();
    try {
      const message = await mongo
        .collection("messages")
        .aggregate([
          {
            $match: {
              userId: ObjectId(req.params.userId),
              _id: ObjectId(req.params.idMsg),
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
              localField: "userId",
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
                  in: {
                    name: "$$user.name",
                    surname: "$$user.surname",
                    _id: "$$user._id",
                  },
                },
              },
            },
          },
        ])
        .toArray();

      if (!message.length) {
        res.status(404).send("Message not found");
      } else {
        res.json(message[0]);
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  }
);

// Creazione di un nuovo messaggio
router.post("", check("text").trim().isLength({ min: 1 }).isString(), async (req, res) => {
  if (!req.isAuthenticated) {
    return res.status(401).send("Unauthorized");
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send("Invalid message");
  }

  const message = {
    userId: ObjectId(req.id),
    text: req.body.text,
    date: new Date(),
  };

  const mongo = db.getDb();
  const insertedMessage = await mongo.collection("messages").insertOne(message);
  const insertedId = insertedMessage.insertedId;

  const insertedMessageData = await mongo
    .collection("messages")
    .aggregate([
      {
        $match: {
          _id: insertedId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          date: 1,
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
    ])
    .toArray();
  res.json(insertedMessageData[0]);
});

module.exports = router;
