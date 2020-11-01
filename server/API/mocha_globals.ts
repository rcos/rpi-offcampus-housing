import "mocha";
import mongoose from "mongoose";

import { connectMongo, server } from "../server";

before(async () => {
  await connectMongo();
  console.log(`✔ Successfully connect to MongoDB instance.`);
});

after(async () => {
  await mongoose.disconnect();
  console.log(`✔ Successfully disconnected from MongoDB instance.`);
  await new Promise((res, rej) =>
    server.close((err) => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    })
  );
  console.log(`✔ Successfully closed server.`);
});
