import * as faker from "faker";

// helper functions
const getRandomIdIndex = (counter) => ({});

// miscllaneous models
interface Content {
  text: { [key: string]: string };
  images: { [key: string]: string };
}

// students
interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

let global_student_counter = 0;
const generate_student = (values: Partial<Student>): Student => ({
  id: `test_student_id_${global_student_counter++}`,
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  email: faker.internet.email(),
  phone_number: faker.phone.phoneNumber(),
  ...values,
});

// landlord
interface Landlord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

let global_landlord_counter = 0;
const generate_landlord = (values: Partial<Landlord>): Landlord => ({
  id: `test_landlord_id_${global_landlord_counter++}`,
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  email: faker.internet.email(),
  phone_number: faker.phone.phoneNumber(),
  ...values,
});

// property
interface Property {
  id: string;
  landlord_id: string;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  property_id: string;
  description: Content;
  // reviews
  date_updated: Date;
  period_available: {
    start: Date;
    end: Date;
  };
  price: {
    // amenity;
    utility_included: boolean;
  };
  sq_ft: number;
}

let global_property_counter = 0;
const generate_property = (values: Partial<Property>): Property => ({
  id: `test_property_id_${global_property_counter++}`,

  ...values,
});

// student reviews
interface StudentReview {
  property_id: string;
  student_id: string;
  content: Content;
  rating: {
    propery: number;
    landlord: number;
  };
  term: string;
}

let global_student_review_counter = 0;
const generate_student_review = ({
  content: { ...contentValues, contentImages },
  rating,
  ...values
}: Partial<StudentReview>): StudentReview => ({
  ...values,
});
