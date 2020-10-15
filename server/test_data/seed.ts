import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import * as faker from "faker";

import { ObjectID } from "mongodb";

// defaults
const DEFAULT_OUT_DIRECTORY = ".";
const DEFAULT_OUT_STUDENTS_FILE = "students.json";
const DEFAULT_OUT_LANDLORDS_FILE = "landlords.json";
const DEFAULT_OUT_PROPERTIES_FILE = "properties.json";
const DEFAULT_OUT_STUDENT_REVIEWS = "reviews.json";
const DEFAULT_NUM_STUDENTS = 200;
const DEFAULT_NUM_LANDLORDS = 15;
const DEFAULT_NUM_PROPERTIES = 40;
const DEFAULT_NUM_STUDENT_REVIEWS = 50;
const DEFAULT_SEED = 1;

// helper models
type Counter = number;

// need to do this way so stringify is valid
type MongoObjectID = {
  $oid: ObjectID;
};

interface MongoObject {
  _id: MongoObjectID;
}

interface Content {
  text: string;
  images: string[];
}

interface Profile {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}

// helper functions
interface SeedProps {
  seed: number;
}
const seedGenerator = ({ seed }: SeedProps) => {
  faker.seed(seed);
};
seedGenerator({ seed: DEFAULT_SEED });

const getRandomIdIndex = (counter: Counter) => faker.random.number(counter);

const objectFactory = <T>(n: number, generator: () => T) => {
  const objects: T[] = [];
  for (let i = 0; i < n; i++) {
    objects.push(generator());
  }
  return objects;
};

const writeFileAsync = promisify(fs.writeFile);

/** Return random rating 1-5 inclusive */
const getRandomRating = () => faker.random.number({ min: 1, max: 5 });

const getRandomContent = (): Content => ({
  text: faker.lorem.paragraph(faker.random.number({ min: 3, max: 10 })),
  images: Array.from({ length: faker.random.number(10) }, () =>
    faker.image.image()
  ),
});

const getRandomTerm = () => {
  const season = faker.random.arrayElement([
    "Spring",
    "Summer",
    "Fall",
    "Winter",
  ]);
  const year = new Date().getFullYear() - faker.random.number(5);

  return {
    start_date: "",
    end_date: "",
    name: `${season} ${year}`,
  };
};

const getRandomProfile = (isStudent?: boolean): Profile => {
  const first_name = faker.name.firstName();
  const last_name = faker.name.lastName();
  return {
    first_name,
    last_name,
    email: isStudent
      ? `${getRcsId(first_name, last_name)}@rpi.edu`
      : faker.internet.email(first_name, last_name),
    phone_number: faker.phone.phoneNumber("(###) ### - ####"),
  };
};

const rcsIdCounter: { [rcsIdName: string]: number } = {};
const getRcsIdName = (first_name: string, last_name: string) =>
  `${last_name.toLowerCase().slice(0, 5)}${first_name[0].toLowerCase()}`;
const getRcsId = (first_name: string, last_name: string) => {
  const rcsIdName = getRcsIdName(first_name, last_name);

  if (rcsIdCounter[rcsIdName] === undefined) {
    rcsIdCounter[rcsIdName] = 0;
  }

  if (rcsIdCounter[rcsIdName] === 0) {
    rcsIdCounter[rcsIdName]++;
    return rcsIdName;
  } else {
    return rcsIdName + rcsIdCounter[rcsIdName]++;
  }
};

// students
type Student = MongoObject & Profile;

const studentIds: MongoObjectID[] = [];
const getStudentId = () => {
  const id = { $oid: new ObjectID() };
  studentIds.push(id);
  return id;
};
const getRandomStudentId = () =>
  studentIds[faker.random.number(studentIds.length - 1)];
const generateStudent = (values?: Partial<Student>): Student => ({
  _id: getStudentId(),
  ...getRandomProfile(true),
  ...values,
});
const generateStudents = (n: number) => objectFactory(n, generateStudent);

// landlord
type Landlord = {
  rating: number;
} & MongoObject &
  Profile;

const landlordIds: MongoObjectID[] = [];
const getLandlordId = () => {
  const id = { $oid: new ObjectID() };
  landlordIds.push(id);
  return id;
};
const getRandomLandlordId = () =>
  landlordIds[faker.random.number(landlordIds.length - 1)];
const generateLandlord = (values?: Partial<Landlord>): Landlord => ({
  _id: getLandlordId(),
  rating: getRandomRating(),
  ...getRandomProfile(),
  ...values,
});
const generateLandlords = (n: number) => objectFactory(n, generateLandlord);

// property
type Property = {
  landlord_id: MongoObjectID;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  property_id: MongoObjectID;
  description: Content;
  date_update: Date;
  period_available: {
    start: Date;
    end: Date;
  };
  lease_duration: string;
  price: number;
  amenities: string[];
  // utility_included: boolean;
  sq_ft: number;
} & MongoObject;

const propertyIds: MongoObjectID[] = [];
const generatePropertyId = () => {
  const id = { $oid: new ObjectID() };
  propertyIds.push(id);
  return id;
};
const getRandomPropertyId = () =>
  propertyIds[faker.random.number(propertyIds.length - 1)];
const generateProperty = (values?: Partial<Property>): Property => {
  const lease_start = faker.date.soon(
    faker.random.number({ min: 10, max: 200 })
  );
  const lease_duration = faker.random.boolean() ? 6 : 12;

  return {
    _id: generatePropertyId(),
    landlord_id: getRandomLandlordId(),
    location: {
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip: faker.address.zipCode(),
    },
    property_id: getRandomPropertyId(),
    description: getRandomContent(),
    date_update: faker.date.recent(faker.random.number(100)),
    period_available: {
      start: lease_start,
      end: new Date(
        lease_start.setMonth(lease_start.getMonth() + lease_duration)
      ),
    },
    lease_duration: `${lease_duration} months`,
    price: faker.random.number({ min: 300, max: 2000 }),
    amenities: faker.random.words(faker.random.number(5)).split(" "),
    // utility_included: faker.random.boolean(),
    sq_ft: faker.random.number({ min: 500, max: 2000 }),
    ...values,
  };
};
const generateProperties = (n: number) => objectFactory(n, generateProperty);

// student reviews
type StudentReview = {
  property_id: MongoObjectID;
  student_id: MongoObjectID;
  content: Content;
  rating: {
    property: number;
    landlord: number;
  };
  term: {
    start_date: string;
    end_date: string;
  };
} & MongoObject;

const studentReviewIds: MongoObjectID[] = [];
const generateStudentReviewId = () => {
  const id = { $oid: new ObjectID() };
  studentReviewIds.push(id);
  return id;
};
const getRandomStudentReviewId = () =>
  studentReviewIds[faker.random.number(studentReviewIds.length - 1)];
const generateStudentReview = (
  studentReviewValues?: Partial<StudentReview>
): StudentReview => {
  const { rating: ratingValues, ...values } = studentReviewValues ?? {};
  const property_id = getRandomPropertyId();
  return {
    _id: generateStudentReviewId(),
    property_id,
    student_id: getRandomStudentId(),
    content: getRandomContent(),
    rating: {
      property: getRandomRating(),
      landlord: getRandomRating(),
    },
    term: getRandomTerm(),
    ...values,
  };
};
const generateStudentReviews = (n: number) =>
  objectFactory(n, generateStudentReview);

type GenerateDataProps = {
  numStudents: number;
  numProperties: number;
  numLandlords: number;
  numStudentReviews: number;
} & Partial<SeedProps>;
const generateData = ({
  seed,
  numStudents,
  numProperties,
  numLandlords,
  numStudentReviews,
}: GenerateDataProps) => {
  if (seed !== undefined) {
    seedGenerator({ seed });
  }

  const students = generateStudents(numStudents);
  const properties = generateProperties(numProperties);
  const landlords = generateLandlords(numLandlords);
  const studentReviews = generateStudentReviews(numStudentReviews);

  return {
    students,
    properties,
    landlords,
    studentReviews,
  };
};

type WriteDataProps = {
  directory?: string;
} & GenerateDataProps;
const writeData = async (props?: WriteDataProps & Partial<SeedProps>) => {
  const { seed, directory, ...generateDataProps } = props ?? {};

  if (seed !== undefined) {
    seedGenerator({ seed });
  }

  const directoryPath = path.resolve(
    __dirname,
    directory ?? DEFAULT_OUT_DIRECTORY
  );

  const { students, properties, landlords, studentReviews } = generateData({
    numStudents: DEFAULT_NUM_STUDENTS,
    numLandlords: DEFAULT_NUM_LANDLORDS,
    numProperties: DEFAULT_NUM_PROPERTIES,
    numStudentReviews: DEFAULT_NUM_STUDENT_REVIEWS,
    ...generateDataProps,
  });

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }

  return Promise.all([
    writeFileAsync(
      path.resolve(directoryPath, DEFAULT_OUT_STUDENTS_FILE),
      JSON.stringify(students)
    ),
    writeFileAsync(
      path.resolve(directoryPath, DEFAULT_OUT_PROPERTIES_FILE),
      JSON.stringify(properties)
    ),
    writeFileAsync(
      path.resolve(directoryPath, DEFAULT_OUT_LANDLORDS_FILE),
      JSON.stringify(landlords)
    ),
    writeFileAsync(
      path.resolve(directoryPath, DEFAULT_OUT_STUDENT_REVIEWS),
      JSON.stringify(studentReviews)
    ),
  ]);
};

export {
  seedGenerator,
  generateStudent,
  generateStudents,
  generateProperty,
  generateProperties,
  generateLandlord,
  generateLandlords,
  generateStudentReview,
  generateStudentReviews,
  generateData,
  writeData,
};
