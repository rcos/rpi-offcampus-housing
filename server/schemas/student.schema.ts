import mongoose from "mongoose";

var Schema = mongoose.Schema;

var StudentSchema = new Schema({
    first_name: String,
    last_name: String,
    email: String,
    phone_number: Number
});

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;