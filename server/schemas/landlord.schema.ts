import mongoose from "mongoose";

var Schema = mongoose.Schema;


var LandlordSchema = new Schema({
    first_name: String,
    last_name: String,
    email: String,
    phone_number: Number,
    rating: Number //included to be able to access landlord rating quickly
});

const Landlord = mongoose.model("Landlord", LandlordSchema);
module.exports = Landlord;