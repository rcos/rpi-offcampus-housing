import mongoose from "mongoose";
const Landlord = require("./landlord.schema");
const Review = require("./review.schema");

var Schema = mongoose.Schema;

//This needs to be very fine tuned to match what we want.
// I'll be going back over this again when we get a chance to meet.
var PropertySchema = new Schema({
    landlord: Landlord.schema,
    location: String,
    property_id: String,
    description: String,
    reviews: [Review.schema],
    date_update: Date,
    period_available: Date,
    lease_duration: String,
    price: Number,
    amenities: [String],
    sq_ft: Number
});

const Property = mongoose.model("Property", PropertySchema);
module.exports = Property;