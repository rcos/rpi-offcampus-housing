import * as fs from "fs";

import { Student as _Student_, Property as _Property_, /*StudentReview, Landlord*/ } from "./seed";
import {Student} from '../GQL/entities/Student'
import {Property} from '../GQL/entities/Property'
import { exit } from "process";

// const rawLandlords: Landlord[] = require("../test_data/landlords.json");
const rawProperties: _Property_[] = require("./properties.json");
// const rawReviews: StudentReview[] = require("../test_data/reviews.json");
const rawStudents: _Student_[] = require("./students.json");

const convertOidToStr = (oid: any): string => oid.$oid;

/*
const landlords: ILandlord[] = rawLandlords.map((landlord) => ({
  ...landlord,
  _id: convertOidToStr(landlord._id),
}));*/

const properties: Property[] = rawProperties.map((property) => ({
  ...property,
  _id: convertOidToStr(property._id),
  landlord: convertOidToStr(property.landlord)
}));

/*
const reviews: IReview[] = rawReviews.map((review) => ({
  ...review,
  _id: convertOidToStr(review._id),
  student_id: convertOidToStr(review.student_id),
  property_id: convertOidToStr(review.property_id),
  landlord_id: convertOidToStr(review.landlord_id),
}));*/

const students: Student[] = rawStudents.map((student) => ({
  ...student,
  _id: convertOidToStr(student._id),
}));

const randomSample = <T>({of}:{of: T[]}): T => {
  if (of.length == 0) {
    console.error(`randomSample:: collection is empty.`);
    exit(0);
  }
  return of[ Math.floor(Math.random() * of.length) ];
}

export { /*landlords, reviews,*/ properties, students, randomSample};
