import mongoose from "mongoose";

var Schema = mongoose.Schema;

interface IStudent {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  _id: string;
  auth_info: Object;
}

type IStudentDoc = IStudent & mongoose.Document;

var StudentSchema = new Schema({
  first_name: String,
  last_name: String,
  email: String,
  phone_number: String,
  saved_properties: [{ type: mongoose.Types.ObjectId, ref: "Property" }],
  auth_info: Object,
});

const Student = mongoose.model<IStudentDoc>("Student", StudentSchema);
export default Student;
export { IStudentDoc, IStudent };
