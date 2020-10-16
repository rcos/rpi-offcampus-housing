import mongoose from "mongoose";

var Schema = mongoose.Schema;

interface ILandlordDoc extends mongoose.Document {
    _id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string
    rating: number
}

var LandlordSchema = new Schema({
    first_name: String,
    last_name: String,
    email: String,
    phone_number: String,
    rating: Number //included to be able to access landlord rating quickly
});

const Landlord = mongoose.model<ILandlordDoc>("Landlord", LandlordSchema);
export default Landlord;
export { ILandlordDoc }