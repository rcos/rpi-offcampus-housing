import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";

import { InstitutionResolver } from "./resolvers/institution.resolver";

var server;

const initApolloServer = async () => {
  const schema = await buildSchema({
    resolvers: [InstitutionResolver],
    validate: false,
  });

  server = new ApolloServer({ schema });

  return server;
};

export { server, initApolloServer };
