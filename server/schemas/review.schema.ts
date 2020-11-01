import mongoose from "mongoose";

var Schema = mongoose.Schema;

interface IReview {
  property_id: string;
  landlord_id: string;
  student_id: string;
  content: string;
  rating_categories: {
    responsiveness: number;
    sound_quality: number;
  };
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
  landlord_id: {
    type: mongoose.Types.ObjectId,
    ref: "Landlord",
  },
  student_id: {
    type: mongoose.Types.ObjectId,
    ref: "Student",
  },
  content: String,
  rating_categories: {
    // categories for landlord
    responsiveness: Number,

    // categories for property
    sound_quality: Number,
  },
  term: {
    start_date: Date,
    end_date: Date,
  },
});

const Review = mongoose.model<IReviewDoc>("Review", ReviewSchema);
export default Review;
export { IReviewDoc, IReview };
