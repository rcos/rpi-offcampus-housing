import mongoose from "mongoose";

var Schema = mongoose.Schema;

//This needs to be fine tuned to match our schema specs.
var ReviewSchema = new Schema({
    property_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Property'
    },
    student_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Student'
    },
    content: String,
    rating: Number, //1-5? idk how this is gonna work
    term: Object
});

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;