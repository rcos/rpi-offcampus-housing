import { Field, ObjectType } from "type-graphql";

import { LocationInterface } from "../../models/location";

@ObjectType()
class LocationEntity implements LocationInterface {
  @Field()
  address!: string;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  zip!: string;
}

export { LocationEntity };
