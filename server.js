require('dotenv').config();
import express from 'express';
import logger from 'morgan';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './schema';
import { getUser, protectResolver } from './users/users.utils';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import { useServer } from 'graphql-ws/lib/use/ws';

const PORT = process.env.PORT;
const startServer = async () => {
  const app = express();
  app.use(logger('dev'));
  app.use('/static', express.static('uploads'));
  app.use(graphqlUploadExpress());

  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  // const server = new ApolloServer({
  //   schema,
  //   csrfPrevention: true,
  //   cache: 'bounded',
  //   // plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  // });

  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/graphql',
  });

  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  const serverCleanup = useServer({ schema }, wsServer);

  const apollo = new ApolloServer({
    resolvers,
    typeDefs,
    context: async ({ req }) => {
      if (req) {
        return {
          loggedInUser: await getUser(req.headers.token),
        };
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await apollo.start();
  apollo.applyMiddleware({ app });
  await new Promise((resolve) => httpServer.listen(PORT, resolve));
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${apollo.graphqlPath}`
  );
};

startServer();
