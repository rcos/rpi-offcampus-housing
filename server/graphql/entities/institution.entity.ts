import { ObjectType, Field } from "type-graphql";

import { InstitutionInterface } from "../../models/institution";
import { LocationEntity } from "./location.entity";

@ObjectType()
class InstitutionEntity implements InstitutionInterface {
  // @Field(() => ID)
  // // Add ! for https://github.com/Microsoft/TypeScript-Vue-Starter/issues/36
  // _id!: string;
  @Field()
  name!: string;

  @Field()
  location!: LocationEntity;
}

export { InstitutionEntity };
