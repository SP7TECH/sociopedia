import { client } from "./../index.js";
import { ObjectId } from "mongodb";

// Create Post

export const createPosts = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;

    let userID = new ObjectId(userId);
    const user = await client
      .db("sociopedia")
      .collection("users")
      .findOne({ _id: userID });

    await client.db("sociopedia").collection("posts").insertOne({
      userId: userID,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });

    const posts = await client.db("sociopedia").collection("posts").find({});
    res.status(201).json(posts);
  } catch (error) {
    return res.status(409).send({ message: error.message });
  }
};

// Read posts

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await client.db("sociopedia").collection("posts").find({});
    const results = posts.toArray();

    return res.status(200).json(results);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;

    let userId = new ObjectId(id);
    const posts = await client
      .db("sociopedia")
      .collection("posts")
      .find({ userId: userId });
    const results = posts.toArray();

    return res.status(200).json(results);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

// Update posts

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    let postId = new ObjectId(id);
    const post = await client
      .db("sociopedia")
      .collection("posts")
      .findOne({ _id: postId });
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await client
      .db("sociopedia")
      .collection("posts")
      .updateOne({ _id: postId }, { likes: post.likes });

    res.status(200).json(updatedPost);
  } catch (error) {
    return res.status().send({ message: error.message });
  }
};
