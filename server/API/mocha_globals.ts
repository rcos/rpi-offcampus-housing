import "mocha";
import mongoose from "mongoose";

import chai from "chai";
import chaiHttp = require("chai-http");

chai.use(chaiHttp);

import { app, connectMongo } from "../server";

let client: ChaiHttp.Agent;

before((done) => {
  console.log("✔ Starting tests");
  connectMongo()
    .then(() => {
      client = chai.request(app).keepOpen();
      console.log(`✔ Successfully started server.`);
      done();
    })
    .catch((err) => {
      throw done(err);
    });
});

after((done) => {
  console.log("✔ All done with tests");
  mongoose
    .disconnect()
    .then(() => {
      console.log(`✔ Successfully disconnected from MongoDB instance.`);
      return client.close((err) => {
        if (!err) {
          console.log(`✔ Successfully closed server.`);
        }
        done(err);
      });
    })
    .catch((err) => {
      done(err);
    });
});

export { client, chai };
