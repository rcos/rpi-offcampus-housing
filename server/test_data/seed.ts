import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import * as faker from "faker";

// defaults
const DEFAULT_OUT_DIRECTORY = ".";
const DEFAULT_OUT_STUDENTS_FILE = "students.json";
const DEFAULT_OUT_LANDLORDS_FILE = "landlords.json";
const DEFAULT_OUT_PROPERTIES_FILE = "properties.json";
const DEFAULT_OUT_STUDENT_REVIEWS = "student_reviews.json";
const DEFAULT_NUM_STUDENTS = 200;
const DEFAULT_NUM_LANDLORDS = 15;
const DEFAULT_NUM_PROPERTIES = 40;
const DEFAULT_NUM_STUDENT_REVIEWS = 50;
const DEFAULT_SEED = 1;

// helper models
type Counter = number;

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
  return `${season} ${year}`;
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
type Student = {
  id: string;
} & Profile;

let globalStudentCounter: Counter = 0;
const getStudentId = (index?: number) =>
  `test_student_id_${index ?? globalStudentCounter++}`;
const getRandomStudentId = () =>
  getStudentId(getRandomIdIndex(globalStudentCounter));
const generateStudent = (values?: Partial<Student>): Student => ({
  id: getStudentId(),
  ...getRandomProfile(true),
  ...values,
});
const generateStudents = (n: number) => objectFactory(n, generateStudent);

// landlord
type Landlord = {
  id: string;
  rating: number;
} & Profile;

let globalLandlordCounter: Counter = 0;
const getLandlordId = (index?: number) =>
  `test_landlord_id_${index ?? globalLandlordCounter++}`;
const getRandomLandlordId = () =>
  getLandlordId(getRandomIdIndex(globalLandlordCounter));
const generateLandlord = (values?: Partial<Landlord>): Landlord => ({
  id: getLandlordId(),
  rating: getRandomRating(),
  ...getRandomProfile(),
  ...values,
});
const generateLandlords = (n: number) => objectFactory(n, generateLandlord);

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
  reviews: string[];
  date_updated: Date;
  period_available: {
    start: Date;
    end: Date;
  };
  lease_duration: number;
  price: number;
  amenities: string[];
  // utility_included: boolean;
  sq_ft: number;
}

let globalPropertyCounter: Counter = 0;
const getPropertyId = (index?: number) =>
  `test_property_id_${index ?? globalPropertyCounter++}`;
const getRandomPropertyId = () =>
  getPropertyId(getRandomIdIndex(globalPropertyCounter));
const generateProperty = (values?: Partial<Property>): Property => {
  const lease_start = faker.date.soon(
    faker.random.number({ min: 10, max: 200 })
  );
  const lease_duration = faker.random.boolean() ? 6 : 12;

  return {
    id: getPropertyId(),
    landlord_id: getRandomLandlordId(),
    location: {
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip: faker.address.zipCode(),
    },
    property_id: getRandomPropertyId(),
    description: getRandomContent(),
    reviews: Array.from({ length: faker.random.number(10) }).map(() =>
      getRandomStudentReviewId()
    ),
    date_updated: faker.date.recent(faker.random.number(100)),
    period_available: {
      start: lease_start,
      end: new Date(
        lease_start.setMonth(lease_start.getMonth() + lease_duration)
      ),
    },
    lease_duration,
    price: faker.random.number({ min: 300, max: 2000 }),
    amenities: faker.random.arrayElements(faker.random.number(5)),
    // utility_included: faker.random.boolean(),
    sq_ft: faker.random.number({ min: 500, max: 2000 }),
    ...values,
  };
};
const generateProperties = (n: number) => objectFactory(n, generateProperty);

// student reviews
interface StudentReview {
  property_id: string;
  student_id: string;
  content: Content;
  rating: {
    property: number;
    landlord: number;
  };
  term: string;
}

let globalStudentReviewCounter: Counter = 0;
const getStudentReviewId = (index?: number) =>
  `test_student_review_id_${index ?? globalStudentReviewCounter}`;
const getRandomStudentReviewId = () =>
  getStudentReviewId(getRandomIdIndex(globalStudentReviewCounter));
const generateStudentReview = (
  studentReviewValues?: Partial<StudentReview>
): StudentReview => {
  const { rating: ratingValues, ...values } = studentReviewValues ?? {};
  return {
    property_id: getRandomPropertyId(),
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
