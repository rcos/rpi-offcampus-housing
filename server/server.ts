import express, { application } from "express";
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

const PORT = process.env.SERVER_PORT;

const MONGO_DB_NAME = "housing-database";
const MONGO_PREFIX = process.env.MONGO_DB_PREFIX ?? "mongodb+srv";
const MONGO_HOST = process.env.MONGO_DB_HOST ?? "cluster0.vsneo.mongodb.net";
const MONGO_AUTH_SOURCE = process.env.MONGO_DB_AUTH_SOURCE ?? MONGO_DB_NAME; // defaults to provided db
const MONGO_URI = `${MONGO_PREFIX}://${process.env.MONGO_DB_CLUSTER_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${MONGO_HOST}/${MONGO_DB_NAME}?retryWrites=true&w=majority&authSource=${MONGO_AUTH_SOURCE}`;

// setup middleware
import bodyParser from "body-parser";
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// API routes
import StudentGET from "./API/Student/student.get";
import StudentPUT from "./API/Student/student.put";
import LandlordGET from "./API/Landlord/landlord.get";
import LandlordPUT from "./API/Landlord/landlord.put";
import ReviewGET from "./API/Review/review.get";
import ReviewPUT from "./API/Review/review.put";
import PropertyGET from "./API/Property/property.get";
import PropertyPUT from "./API/Property/property.put";
import SearchGET from "./API/Search/search.get";

app.use("/api/students", StudentGET);
app.use("/api/students", StudentPUT);
app.use("/api/landlords", LandlordGET);
app.use("/api/landlords", LandlordPUT);
app.use("/api/reviews", ReviewGET);
app.use("/api/reviews", ReviewPUT);
app.use("/api/properties", PropertyGET);
app.use("/api/properties", PropertyPUT);
app.use("/api/search", SearchGET);

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

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  if (process.env.NODE_ENV !== "test") {
    connectMongo()
      .then(() => {
        console.log(`✔ Successfully connect to MongoDB instance.`);
      })
      .catch((err) => {
        console.error(`❌ Error connecting to mongoose.`);
        console.error(err);
        process.exit(1);
      });
  }
});

export { app, connectMongo, server };
