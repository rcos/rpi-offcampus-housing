import mongoose from "mongoose";
const Landlord = require("./landlord.schema");
const Review = require("./review.schema");

var Schema = mongoose.Schema;

interface IProperty {
  landlord: string;
  location: string;
  description: string;
  reviews: string[];
  date_updated: string;
  period_available: string;
  lease_duration: string;
  price: number;
  amenities: string[];
  sq_ft: number;
}

type IPropertyDoc = IProperty & mongoose.Document;

//This needs to be very fine tuned to match what we want.
// I'll be going back over this again when we get a chance to meet.
var PropertySchema = new Schema({
  landlord: {
    type: mongoose.Types.ObjectId,
    ref: "Landlord",
  },
  location: String,
  description: String,
  reviews: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Review",
    },
  ],
  date_updated: String,
  period_available: String,
  lease_duration: String,
  price: Number,
  amenities: [String],
  sq_ft: Number,
});

const Property = mongoose.model<IPropertyDoc>("Property", PropertySchema);
export default Property;
export { IPropertyDoc, IProperty };
