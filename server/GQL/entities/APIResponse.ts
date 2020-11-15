import {ClassType, ObjectType, Field} from "type-graphql"

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