const express = require("express");
const { check, validationResult } = require("express-validator");
const db = require("../db.js");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Funzione per generare il JWT
function generateJWT(id, username) {
  return jwt.sign({ id: id, username: username }, process.env.JWT_PRIVATE_KEY);
}

// Registrazione di un nuovo utente
router.post(
  "/signup",
  [
    check("username")
      .isLength({ min: 3, max: 16 })
      .withMessage("Lo username deve essere compreso tra 4 e 16 caratteri")
      .trim()
      .notEmpty()
      .withMessage("Lo username non può essere costituito solo da spazi")
      .isString(),
    check("password")
      .isLength({ min: 6 })
      .withMessage("La password deve essere lunga almeno 6 caratteri")
      .trim()
      .notEmpty()
      .withMessage("La password non può essere costituita solo da spazi")
      .isString(),
    check("name")
      .isLength({ min: 1, max: 16 })
      .withMessage("Il nome deve essere compreso tra 1 e 16 caratteri")
      .trim()
      .notEmpty()
      .withMessage("Il nome non può essere costituito solo da spazi")
      .isString(),
    check("surname")
      .isLength({ min: 1, max: 16 })
      .withMessage("Il cognome deve essere compreso tra 1 e 16 caratteri")
      .trim()
      .notEmpty()
      .withMessage("Il cognome non può essere costituito solo da spazi")
      .isString(),
    check("bio")
      .isLength({ min: 1, max: 200 })
      .withMessage("La bio deve essere compresa tra 1 e 200 caratteri")
      .trim()
      .notEmpty()
      .withMessage("La bio non può essere costituita solo da spazi")
      .isString(),
    check("verifyPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Le password non coincidono");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const mongo = db.getDb();

    const { username, password, name, surname, bio } = req.body;

    const user = await mongo.collection("users").findOne({ username });
    if (user) {
      return res.status(400).send({ message: "Username già esistente" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      password: hashedPassword,
      name,
      surname,
      bio,
    };
    const insertedUser = await mongo.collection("users").insertOne(newUser);
    const insertedId = insertedUser.insertedId;

    const token = generateJWT(insertedUser.insertedId, username);

    res.cookie(process.env.JWT_COOKIE_NAME, token, {
      maxAge: 1296000000,
      httpOnly: true,
    });

    res.send({
      message: "Registrazione completata",
      createdUser: { _id: insertedId, username, name, surname, bio },
    });
  }
);

// Login di un utente
router.post(
  "/signin",
  [
    check("username")
      .isLength({ min: 4 })
      .withMessage("Lo username deve essere lungo almeno 4 caratteri")
      .trim()
      .notEmpty()
      .withMessage("Lo username non può essere costituito solo da spazi")
      .isString(),
    check("password")
      .isLength({ min: 6 })
      .withMessage("La password deve essere lunga almeno 6 caratteri")
      .trim()
      .notEmpty()
      .withMessage("La password non può essere costituita solo da spazi")
      .isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    if (req.isAuthenticated) {
      return res.status(400).send({ message: "Utente già loggato" });
    }
    const mongo = db.getDb();
    const { username, password } = req.body;

    const user = await mongo.collection("users").findOne({ username });
    if (!user) {
      return res.status(400).send({ message: "Lo username non esiste" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Password errata" });
    }

    const token = generateJWT(user._id, username);

    res.cookie(process.env.JWT_COOKIE_NAME, token, {
      maxAge: 1296000000,
      httpOnly: true,
    });

    delete user.password;

    res.send({ message: "Loggato con successo", user });
  }
);

// Logout di un utente
router.post("/signout", (req, res) => {
  if (!req.isAuthenticated) {
    return res.status(401).send({ message: "Logout già effettuato" });
  }

  res.clearCookie("jwtSecret");

  res.send({ message: "Logout effettuato con successo" });
});

module.exports = router;
