require('dotenv').config();
import express from 'express';
import logger from 'morgan';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './schema';
import { getUser } from './users/users.utils';
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

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const getDynamicContext = async (ctx) => {
    const { token } = ctx.connectionParams;
    if (token) {
      return {
        loggedInUser: await getUser(token),
      };
    }
    return { loggedInUser: null };
  };

  const serverCleanup = useServer(
    {
      schema,
      context: (ctx, msg, args) => getDynamicContext(ctx, msg, args),
    },
    wsServer
  );

  const apollo = new ApolloServer({
    resolvers,
    typeDefs,
    csrfPrevention: true,
    cache: 'bounded',
    context: async (ctx) => {
      if (ctx.req) {
        return {
          loggedInUser: await getUser(ctx.req.headers.token),
        };
      }
      // else {
      //   const {
      //     connection: { context: wsContext },
      //   } = ctx;
      //   return {
      //     loggedInUser: wsContext.loggedInUser,
      //   };
      // }
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
