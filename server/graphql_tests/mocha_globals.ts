import { ApolloServer } from "apollo-server-express";

import "mocha";
import mongoose from "mongoose";
import http from "http";
import {
  ApolloServerTestClient,
  createTestClient,
} from "apollo-server-testing";
import { server } from "../server";

var apolloServer: ApolloServer,
  httpServer: http.Server,
  apolloServerTestClient: ApolloServerTestClient;

before(async () => {
  // redeclare apolloServer because javascript scoping is nonexistent
  const servers = await server;

  apolloServer = servers.apolloServer;
  httpServer = servers.server;
  apolloServerTestClient = createTestClient(servers.apolloServer);
});

after(async () => {
  await mongoose.disconnect();
  await apolloServer.stop();
  await new Promise((res, rej) =>
    httpServer.close((err) => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    })
  );
});

export { apolloServerTestClient };
