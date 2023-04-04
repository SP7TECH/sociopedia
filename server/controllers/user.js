import { client } from "./../index.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await client
      .db("sociopedia")
      .collection("users")
      .findOne({ _id: id });

    return res.status(200).json(user[0]);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await client
      .db("sociopedia")
      .collection("users")
      .findOne({ _id: id });

    const friends = await Promise.all(
      user[0].friends.map((el) =>
        client.db("sociopedia").collection("users").find({ _id: el })
      )
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

    const user = await client
      .db("sociopedia")
      .collection("users")
      .findOne({ _id: id });
    const friend = await await client
      .db("sociopedia")
      .collection("users")
      .findOne({ _id: friendId });

    // If the user is already a friend
    if (user[0].friends.includes(friendId)) {
      user[0].friends = user[0].friends.filter((id) => id !== friendId);
      friend[0].friends = friend[0].friends.filter((id) => id !== id);
    } else {
      // If the user is not a friend

      user[0].friends.push(friendId);
      friend[0].friends.push(id);
    }

    await client
      .db("sociopedia")
      .collection("users")
      .updateOne(
        { _id: id },
        { $set: { friends: user[0].friends } },
        { $upsert: true }
      );
    await client
      .db("sociopedia")
      .collection("users")
      .updateOne(
        { _id: friendId },
        { $set: { friends: friend[0].friends } },
        { $upsert: true }
      );

    const friendList = await Promise.all(
      user[0].friends.map((el) =>
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
