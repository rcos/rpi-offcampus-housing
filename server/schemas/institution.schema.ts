import { getModelForClass, prop } from "@typegoose/typegoose";
import { Document } from "mongoose";

import { InstitutionInterface } from "../models/institution";
import { LocationInterface } from "../models/location";

class Institution implements InstitutionInterface {
  @prop()
  name!: string;

  @prop()
  location!: LocationInterface;
}

const InstitutionModel = getModelForClass(Institution);

type InstitutionDocument = InstitutionInterface & Document;

export {
  Institution,
  InstitutionModel as InstitutionSchema,
  InstitutionDocument,
};
