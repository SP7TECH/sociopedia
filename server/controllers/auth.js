import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { client } from "./../index.js";

// Register User

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends = [],
      location,
      occupation,
    } = req.body;

    const user = await client
      .db("sociopedia")
      .collection("users")
      .findOne({ email: email });
    if (user) return res.status(500).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await client
      .db("sociopedia")
      .collection("users")
      .insertOne({
        firstName,
        lastName,
        email,
        password: passwordHash,
        picturePath,
        friends,
        location,
        occupation,
        viewedProfile: Math.floor(Math.random() * 10000),
        impressions: Math.floor(Math.random() * 10000),
        createdOn: Date.now(),
      });

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Log In

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await client
      .db("sociopedia")
      .collection("users")
      .findOne({ email: email });

    if (!user) return res.status(400).json({ error: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(403).json({ error: "Invalid credentials " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;

    res.status(200).json({ token, user });
  } catch (error) {
    console.error(error);
  }
};
