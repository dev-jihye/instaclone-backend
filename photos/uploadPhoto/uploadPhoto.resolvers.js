import client from '../../client';
import { protectResolver } from '../../users/users.utils';

export default {
  Mutation: {
    uploadPhoto: protectResolver(
      async (_, { file, caption }, { loggedInUser }) => {
        let hashtagObj = [];
        if (caption) {
          const hashtags = caption.match(/#[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\w]+/g);
          hashtagObj = hashtags.map((hashtag) => ({
            where: {
              hashtag,
            },
            create: {
              hashtag,
            },
          }));
        }
        return client.photo.create({
          data: {
            file,
            caption,
            user: {
              connect: {
                id: loggedInUser.id,
              },
            },
            ...(hashtagObj.length > 0 && {
              hashtags: {
                connectOrCreate: hashtagObj,
              },
            }),
          },
        });
        // save the photo with the parsed hashtags
        // add photo to hashtags
      }
    ),
  },
};
