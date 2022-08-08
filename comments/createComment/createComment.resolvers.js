import client from '../../client';
import { protectResolver } from '../../users/users.utils';

export default {
  Mutation: {
    createComment: protectResolver(
      async (_, { payload, photoId }, { loggedInUser }) => {
        const existPhoto = await client.photo.findUnique({
          where: {
            id: photoId,
          },
          select: {
            id: true,
          },
        });
        if (!existPhoto) {
          return {
            ok: false,
            error: 'Photo not found',
          };
        }
        await client.comment.create({
          data: {
            payload,
            photo: {
              connect: {
                id: photoId,
              },
            },
            user: {
              connect: {
                id: loggedInUser.id,
              },
            },
          },
        });
        return {
          ok: true,
        };
      }
    ),
  },
};
