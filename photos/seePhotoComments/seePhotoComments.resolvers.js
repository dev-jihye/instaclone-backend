import client from '../../client';

export default {
  Query: {
    seePhotoComments: (_, { id, lastId }) =>
      client.comment.findMany({
        where: {
          photoId: id,
        },
        take: 5,
        skip: lastId ? 1 : 0,
        ...(lastId && { cursor: { id: lastId } }),
        orderBy: {
          createdAt: 'asc',
        },
      }),
  },
};
