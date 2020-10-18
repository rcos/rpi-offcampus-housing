import mongoose from "mongoose";

var Schema = mongoose.Schema

interface IInstitutionDoc extends mongoose.Document {
  name: String
  location: {
    address: string
    city: string
    state: string
    zip: string
  }
}

var InstitutionSchema = new Schema({
  name: String,
  location: {
    address: String,
    city: String,
    state: String,
    zip: String
  }
})

const Institution = mongoose.model<IInstitutionDoc>("Institution", InstitutionSchema)
export default Institution;
export { IInstitutionDoc }