import * as fs from "fs";

import { Student, Landlord, StudentReview, Property } from "./seed";

import { ILandlord } from "../schemas/landlord.schema";
import { IProperty } from "../schemas/property.schema";
import { IReview } from "../schemas/review.schema";
import { IStudent } from "../schemas/student.schema";

const rawLandlords: Landlord[] = require("../test_data/landlords.json");
const rawProperties: Property[] = require("../test_data/properties.json");
const rawReviews: StudentReview[] = require("../test_data/reviews.json");
const rawStudents: Student[] = require("../test_data/students.json");

const convertOidToStr = (oid: any): string => oid.$oid;

const landlords: ILandlord[] = rawLandlords.map((landlord) => ({
  ...landlord,
  _id: convertOidToStr(landlord._id),
}));

const properties: IProperty[] = rawProperties.map((property) => ({
  ...property,
  _id: convertOidToStr(property._id),
  landlord: convertOidToStr(property.landlord),
  reviews: property.reviews.map(convertOidToStr),
}));

const reviews: IReview[] = rawReviews.map((review) => ({
  ...review,
  _id: convertOidToStr(review._id),
  student_id: convertOidToStr(review.student_id),
  property_id: convertOidToStr(review.property_id),
  landlord_id: convertOidToStr(review.landlord_id),
}));

const students: IStudent[] = rawStudents.map((student) => ({
  ...student,
  _id: convertOidToStr(student._id),
}));

export { landlords, properties, reviews, students };
