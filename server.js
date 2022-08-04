require('dotenv').config();
import express from 'express';
import logger from 'morgan';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './schema';
import { getUser, protectResolver } from './users/users.utils';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

const PORT = process.env.PORT;
const startServer = async () => {
  const app = express();
  app.use(logger('dev'));
  app.use('/static', express.static('uploads'));
  app.use(graphqlUploadExpress());

  const apollo = new ApolloServer({
    resolvers,
    typeDefs,
    context: async ({ req }) => {
      return {
        loggedInUser: await getUser(req.headers.token),
        protectResolver,
      };
    },
  });
  await apollo.start();
  apollo.applyMiddleware({ app });
  await new Promise((resolve) => app.listen({ port: PORT }, resolve));
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${apollo.graphqlPath}`
  );
};

startServer();
