import mongoose from "mongoose";

var Schema = mongoose.Schema;

interface IReview {
  property_id: string;
  student_id: string;
  content: string;
  rating: number;
  term: {
    start_date: Date;
    end_date: Date;
  };
}

type IReviewDoc = IReview & mongoose.Document;

//This needs to be fine tuned to match our schema specs.
var ReviewSchema = new Schema({
  property_id: {
    type: mongoose.Types.ObjectId,
    ref: "Property",
  },
  student_id: {
    type: mongoose.Types.ObjectId,
    ref: "Student",
  },
  content: String,
  rating: Number, //1-5? idk how this is gonna work
  term: Object,
});

const Review = mongoose.model<IReviewDoc>("Review", ReviewSchema);
export default Review;
export { IReviewDoc, IReview };
