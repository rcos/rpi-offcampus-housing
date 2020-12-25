import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
const app = express();

// load environment variablesd
dotenv.config({ path: `../.env` });
if (!process.env.NODE_ENV) {
  console.error(`NODE_ENV is not set.\n`);
  process.exit();
}
dotenv.config({ path: `../.env.${process.env.NODE_ENV!.replace(" ", "")}` });

import { frontendPath } from "./config";

const PORT = process.env.SERVER_PORT;

const MONGO_PREFIX = process.env.MONGO_DB_PREFIX ?? "mongodb+srv";
const MONGO_HOST = process.env.MONGO_DB_HOST ?? "cluster0.vsneo.mongodb.net";
const MONGO_URI = 
  process.env.NODE_ENV == `development` ? `'mongodb://localhost:27017/housing-database` :
`${MONGO_PREFIX}://${process.env.MONGO_DB_CLUSTER_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${MONGO_HOST}/housing-database?retryWrites=true&w=majority&authSource=admin`;

// setup middleware
import bodyParser from "body-parser";

let whitelisted_ips = [
  frontendPath(),
  ...(
    Object.keys(process.env)
    .filter((key_: string) => key_.substring(0, 13) == "WHITELIST_IP_")
    .map((key_: string) => `${process.env[key_]!}:${process.env.PORT}`)
  )
]
console.log(whitelisted_ips)
app.use(express.json());
app.use(
  cors({
    origin: whitelisted_ips,
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

// Passport CAS Auth
import passport from "passport";
import session from "express-session";
import CasAuthRouter from "./Authentication/casauth";
import LocalAuthRouter from "./Authentication/localauth";
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", CasAuthRouter);
app.use("/auth", LocalAuthRouter);

import { awsRouter } from "./vendors/aws_s3";
app.use("/vendors/aws_s3", awsRouter);

// SendGrid
import sgMail from '@sendgrid/mail'
sgMail.setApiKey (process.env.SENDGRID_API_KEY as string)

const connectMongo = () =>
  // connect to MongoDB via mongoose
  new Promise((res, rej) =>
    mongoose.connect(
      MONGO_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
      },

      // mongoose connection callback
      (err: any) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      }
    )
  );

// Twilio Router
import smsRouter from './routers/twilio_smsVerify'
app.use('/vendor/twilio', smsRouter)

import "reflect-metadata"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql";
import * as http from "http";
import {StudentResolver, 
  OwnershipResolver, 
  LandlordResolver, 
  FeedbackResolver,
  InstitutionResolver, 
  PropertyResolver} from "./GQL/resolvers"
import { ObjectIdScalar } from "./GQL/entities";
import {ObjectId} from 'mongodb'

const StartServer = async (): Promise<{
  server: http.Server;
  apolloServer: ApolloServer;
}> => {

  const schema = await buildSchema ({
    resolvers: [StudentResolver, 
      OwnershipResolver, 
      LandlordResolver, 
      InstitutionResolver, 
      PropertyResolver,
      FeedbackResolver],
    emitSchemaFile: true,
    validate: true,
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
  });
  const apolloServer = new ApolloServer({ schema });
  apolloServer.applyMiddleware({ app });
  try {
    await connectMongo();
    console.log(`✔ Successfully connect to MongoDB instance.`);
  } catch (err) {
    console.error(`❌ Error connecting to mongoose.`);
    console.error(err);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  return { server, apolloServer };
};

const server = StartServer();

export { app, connectMongo, server, MONGO_URI };
