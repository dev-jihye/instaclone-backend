import client from '../../client';
import { protectResolver } from '../users.utils';

export default {
  Mutation: {
    followUser: protectResolver(async (_, { username }, { loggedInUser }) => {
      const existUser = await client.user.findUnique({ where: { username } });
      if (!existUser) {
        return {
          ok: false,
          error: "User doesn't exist",
        };
      }
      await client.user.update({
        where: {
          id: loggedInUser.id,
        },
        data: {
          following: {
            connect: {
              username,
            },
          },
        },
      });
      return {
        ok: true,
      };
    }),
  },
};
