import express from "express";
import chalk from "chalk";
import Landlord, { ILandlordDoc } from "../../schemas/landlord.schema";

const landlordRouter = express.Router();
import { validId } from "../../helpers";

landlordRouter.get("/:id", (req, res) => {
  /*
  GET /landlord/:id -> Retrieve the landlord that has the specified id, otherwise prompt error.
  */

  console.log(chalk.bgBlue(`👉 GET /api/landlord/:id`));
  let landlord_id = req.params.id;

  validId(landlord_id)
    .then(() => {
      Landlord.findById(landlord_id, (err: any, landlord_doc: ILandlordDoc) => {
        // If an error occurred or the student does not exist, return an error
        if (err || !landlord_doc) {
          console.log(
            chalk.bgRed(
              `❌ Error: Could not find landlord with id: ${landlord_id}`
            )
          );
          res.json({
            success: false,
            error: err ? err : `No landlord found.`,
          });
        }

        // Otherwise, return the _id, first_name, last_name and email of the student
        else {
          console.log(
            chalk.bgGreen(
              `✔ Successfully found landlord with id ${landlord_id}`
            )
          );
          res.json({
            success: true,
            first_name: landlord_doc.first_name,
            last_name: landlord_doc.last_name,
            email: landlord_doc.email,
            _id: landlord_doc._id,
            rating: landlord_doc.rating,
            phone_number: landlord_doc.phone_number,
          });
        }
      });
    })
    .catch(() => {
      console.log(
        chalk.bgRed(`❌ Error: ${landlord_id} is not a valid ObjectId.`)
      );
      res.json({
        success: false,
        error: "Invalid id.",
      });
    });
});

export default landlordRouter;
