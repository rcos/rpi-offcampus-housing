import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import faker from "faker";

import { ObjectID } from "mongodb";
import mongoose from 'mongoose';
import bcrypt from "bcrypt";

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
import {Student as _Student_} from '../GQL/entities/Student'
import {Landlord as _Landlord_} from '../GQL/entities/Landlord'
import {Property as _Property_} from '../GQL/entities/Property'

type MongoObjectID = {
  $oid: ObjectID;
};
type Student = Omit<_Student_, "_id"> & {
  _id: MongoObjectID;
};

type Property = Omit<_Property_, "_id" | "landlord"> & {
  _id:MongoObjectID
  landlord: MongoObjectID
}

type Landlord = Omit<_Landlord_, "_id"> & {
  _id: MongoObjectID
}

class OIDFactory {
  static id_memory: {[key: string]: mongoose.Types.ObjectId[]} = {};

  /**
   * Generate an object id that is unique to the collection_name
   * @param collection_name: string => The collection_name to instantiate the
   * ObjectId within.
   */
  static generateObjectID (collection_name: string): mongoose.Types.ObjectId {
    if (!Object.prototype.hasOwnProperty.call(this.id_memory, collection_name)) this.id_memory[collection_name] = []
    let oid: mongoose.Types.ObjectId;
    do {
      oid = mongoose.Types.ObjectId();
    } while (this.id_memory[collection_name].includes( oid ))
    this.id_memory[collection_name].push(oid)
    return oid;
  }
}

const objectFactory = <T>(n: number, generator: () => T) => {
  const objects: T[] = [];
  for (let i = 0; i < n; i++) {
    objects.push(generator());
  }
  return objects;
};

/**
 * generateStudent
 * @desc Create a new student object with mock data
 */
const generateStudent = (): Student => {
  let _fname: string = faker.name.firstName();
  let _lname: string = faker.name.lastName();
  let mock_student: Student = {
    _id: {$oid: OIDFactory.generateObjectID('student')},
    first_name: _fname,
    last_name: _lname,
    email:`/\\fake_offcmpus_email@+${faker.internet.email(_fname, _lname)}`,
    phone_number: faker.phone.phoneNumber("+1##########"),
    saved_collection: [],
    user_settings: {
      recieve_email_notifications: false,
      push_subscriptions: []
    },
    auth_info: {
      institution_id: '',
      cas_id: `${_fname.replace(' ', '_')}_${_lname.replace(' ', '_')}`
    }
  }
  return mock_student;
}
const generateStudents = (n: number) => objectFactory(n, generateStudent);

/**
 * generateProperty
 * @desc Create a new property object with mock data
 */
const generateProperty = (): Property => {
  return {
    _id: {$oid: OIDFactory.generateObjectID('property')},
    landlord: {$oid: OIDFactory.generateObjectID('landlord')},
    address_line: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.stateAbbr(),
    zip: faker.address.zipCode()
  }
}
const generateProperties = (n: number) => objectFactory(n, generateProperty)

/**
 * generateLandlord
 * @desc Create a new ladlord object with mock data
 */
const generateLandlord = (): Landlord => {
  let _fname: string = faker.name.firstName();
  let _lname: string = faker.name.lastName();
  return {
    _id: {$oid: OIDFactory.generateObjectID('landlord')},
    first_name: _fname,
    last_name: _lname,
    email: `/\\fake_offcmpus_email@+${faker.internet.email(_fname, _lname)}`,
    phone_number: faker.phone.phoneNumber("+1##########"),
    password: bcrypt.hashSync(faker.internet.password(), 1),
    user_settings: {
      recieve_email_notifications: false,
      push_subscriptions: []
    }
  }
}
const gnerateLandlords = (n: number) => objectFactory(n, generateLandlord)

/////////////////////////////////////////////////////////

type GenerateDataProps = {
  numStudents: number;
  numProperties: number;
} & Partial<SeedProps>;
const generateData = ({
  seed,
  numStudents,
  numProperties
}: GenerateDataProps) => {
  if (seed !== undefined) {
    seedGenerator({ seed });
  }

  const students = generateStudents(numStudents);
  const properties = generateProperties(numProperties);

  return {
    students,
    properties
  };
};

interface SeedProps {
  seed: number;
}
const seedGenerator = ({ seed }: SeedProps) => {
  faker.seed(seed);
};
seedGenerator({ seed: DEFAULT_SEED });

const writeFileAsync = promisify(fs.writeFile);
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

  const { students, properties } = generateData({
    numStudents: DEFAULT_NUM_STUDENTS,
    numProperties: DEFAULT_NUM_PROPERTIES,
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
    )
    /*
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
    */
  ]);
};

export {
  Student,
  Property,
  Landlord,
  writeData
}


// need to do this way so stringify is valid
/*
type MongoObjectID = {
  $oid: ObjectID;
};

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

const objectFactory = <T>(n: number, generator: () => T) => {
  const objects: T[] = [];
  for (let i = 0; i < n; i++) {
    objects.push(generator());
  }
  return objects;
};

const writeFileAsync = promisify(fs.writeFile);

// Return random rating 1-5 inclusive
const getRandomRating = () => faker.random.number({ min: 1, max: 5 });

const getRandomTerm = () => {
  const start_date = faker.date.past(faker.random.number(2));
  const end_date = faker.date.future(faker.random.number(2), start_date);
  return {
    start_date,
    end_date,
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
    phone_number: faker.phone.phoneNumber("+1##########"),
  };
};

const getRandomHashedPassword = () =>
  bcrypt.hashSync(faker.internet.password(), 1);

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
type Student = Omit<IStudent, "_id"> & {
  _id: MongoObjectID;
};

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
  auth_info: {},
  ...values,
});
const generateStudents = (n: number) => objectFactory(n, generateStudent);

// landlord
type Landlord = Omit<ILandlord, "_id"> & { _id: MongoObjectID };

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
  password: getRandomHashedPassword(),
  ...getRandomProfile(),
  ...values,
});
const generateLandlords = (n: number) => objectFactory(n, generateLandlord);

// property
type Property = Omit<IProperty, "_id" | "landlord" | "reviews"> & {
  _id: MongoObjectID;
  landlord: MongoObjectID;
  reviews: MongoObjectID[];
};

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
  const lease_end = new Date(
    lease_start.setMonth(lease_start.getMonth() + lease_duration)
  );

  return {
    _id: generatePropertyId(),
    landlord: getRandomLandlordId(),
    location: faker.fake(
      "{{address.streetAddress}}, {{address.city}}, {{address.stateAbbr}} {{address.zipCode}}"
    ),
    description: faker.lorem.lines(faker.random.number(10)), //getRandomContent(),
    reviews: [], // this population is gonna have to be hacked
    date_updated: faker.date.recent(faker.random.number(100)).toString(),
    period_available: `${lease_start.toDateString()} - ${lease_end.toDateString()}`,
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
type StudentReview = Omit<
  IReview,
  "_id" | "property_id" | "student_id" | "landlord_id"
> & {
  _id: MongoObjectID;
  property_id: MongoObjectID;
  student_id: MongoObjectID;
  landlord_id: MongoObjectID;
};

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
  const { rating_categories: ratingValues, ...values } =
    studentReviewValues ?? {};
  const property_id = getRandomPropertyId();
  return {
    _id: generateStudentReviewId(),
    property_id,
    student_id: getRandomStudentId(),
    landlord_id: getRandomLandlordId(),
    content: faker.lorem.lines(faker.random.number(10)),
    rating_categories: {
      responsiveness: getRandomRating(),
      sound_quality: getRandomRating(),
      ...ratingValues,
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
  const landlords = generateLandlords(numLandlords);
  const properties = generateProperties(numProperties);
  const studentReviews = generateStudentReviews(numStudentReviews);

  // Hack for populating properties -> review shortcut
  studentReviews.forEach((studentReview) => {
    const reviewedProperty = properties.find(
      (property) => property._id.$oid === studentReview.property_id.$oid
    );

    if (reviewedProperty != undefined) {
      reviewedProperty.reviews.push(studentReview._id);
    }
  });

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
  MongoObjectID,
  Student,
  Landlord,
  Property,
  StudentReview,
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
*/