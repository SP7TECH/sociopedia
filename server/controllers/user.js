import { ObjectId } from "mongodb";
import { client } from "./../index.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    let userId = new ObjectId(id);
    const user = await client
      .db("sociopedia")
      .collection("users")
      .findOne({ _id: userId });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    let userId = new ObjectId(id);
    const user = await client
      .db("sociopedia")
      .collection("users")
      .findOne({ _id: userId });

    const friends = await Promise.all(
      user.friends.map((el) => {
        let tempUserId = new ObjectId(el);
        client.db("sociopedia").collection("users").find({ _id: tempUserId });
      })
    );

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    return res.status(200).json(formattedFriends);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

// UPDATE

export const addRemoveFriends = async (req, res) => {
  try {
    const { id, friendId } = req.params;

    let userId = new ObjectId(id);
    let friendID = new ObjectId(id);
    const user = await client
      .db("sociopedia")
      .collection("users")
      .findOne({ _id: userId });
    const friend = await await client
      .db("sociopedia")
      .collection("users")
      .findOne({ _id: friendID });

    // If the user is already a friend
    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      // If the user is not a friend

      user.friends.push(friendId);
      friend.friends.push(id);
    }

    await client
      .db("sociopedia")
      .collection("users")
      .updateOne(
        { _id: id },
        { $set: { friends: user.friends } },
        { $upsert: true }
      );
    await client
      .db("sociopedia")
      .collection("users")
      .updateOne(
        { _id: friendId },
        { $set: { friends: friend.friends } },
        { $upsert: true }
      );

    const friendList = await Promise.all(
      user.friends.map((el) =>
        client.db("sociopedia").collection("users").find({ _id: el })
      )
    );

    const formattedFriends = friendList.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    return res.status(200).json(formattedFriends);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};
