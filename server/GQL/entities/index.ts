import {ClassType, ObjectType, Field} from "type-graphql"
import {ObjectId} from "mongodb"
import { GraphQLScalarType, Kind } from "graphql";

export function APIResult<T>(TItemClass: ClassType<T>) {

  @ObjectType({ isAbstract: true })
  abstract class APIResponseClass {

    @Field(type => Boolean)
    success: boolean;

    @Field(type => String, {nullable: true})
    error?: String;

    @Field(type => TItemClass, {nullable: true})
    data?: T | null;

  }
  return APIResponseClass
}

export type Ref<T> = T | ObjectId

export const ObjectIdScalar = new GraphQLScalarType({
  name: "ObjectId",
  description: "Mongo object id scalar type",
  serialize(value: unknown): string {
    // check the type of received value
    if (!(value instanceof ObjectId)) {
      throw new Error("ObjectIdScalar can only serialize ObjectId values");
    }
    return value.toHexString(); // value sent to the client
  },
  parseValue(value: unknown): ObjectId {
    // check the type of received value
    if (typeof value !== "string") {
      throw new Error("ObjectIdScalar can only parse string values");
    }
    return new ObjectId(value); // value from the client input variables
  },
  parseLiteral(ast): ObjectId {
    // check the type of received value
    if (ast.kind !== Kind.STRING) {
      throw new Error("ObjectIdScalar can only parse string values");
    }
    return new ObjectId(ast.value); // value from the client query
  },
});