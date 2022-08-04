import client from '../../client';
import { protectResolver } from '../users.utils';

export default {
  Mutation: {
    unfollowUser: protectResolver(async (_, { username }, { loggedInUser }) => {
      const existUser = await client.user.findUnique({ where: { username } });
      if (!existUser) {
        return {
          ok: false,
          error: "Can't find user",
        };
      }
      await client.user.update({
        where: {
          id: loggedInUser.id,
        },
        data: {
          following: {
            disconnect: {
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
