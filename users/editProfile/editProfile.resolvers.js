import { createWriteStream } from 'fs';
import bcrypt from 'bcrypt';
import client from '../../client.js';
import { protectResolver } from '../users.utils.js';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { uploadToS3 } from '../../shared/shared.utils.js';

const resolverFn = async (
  _,
  { firstName, lastName, username, email, password: newPassword, bio, avatar },
  { loggedInUser }
) => {
  let avatarUrl = null;
  if (avatar) {
    avatarUrl = await uploadToS3(avatar, loggedInUser.id, 'avatar');
  }

  let uglyPassword = null;
  if (newPassword) {
    uglyPassword = await bcrypt.hash(newPassword, 10);
  }
  const updatedUser = await client.user.update({
    where: {
      id: loggedInUser.id,
    },
    data: {
      firstName,
      lastName,
      username,
      email,
      bio,
      password: uglyPassword ? uglyPassword : newPassword,
      avatar: avatar ? avatarUrl : avatar,
    },
  });
  if (updatedUser.id) {
    return {
      ok: true,
    };
  } else {
    return {
      ok: false,
      error: 'Could not update profile',
    };
  }
};

export default {
  Mutation: {
    editProfile: protectResolver(resolverFn),
  },
  Upload: GraphQLUpload,
};
