import client from '../../client';

export default {
  Query: {
    searchPhoto: (_, { keyword }) => {
      return client.photo.findMany({
        where: {
          caption: {
            startsWith: keyword,
          },
        },
      });
    },
  },
};
