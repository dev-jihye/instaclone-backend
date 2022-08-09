import { NEW_MESSAGE } from '../../constances';
import pubsub from '../../pubsub';

export default {
  Subscription: {
    roomUpdates: {
      subscribe: () => pubsub.asyncIterator(NEW_MESSAGE),
    },
  },
};
