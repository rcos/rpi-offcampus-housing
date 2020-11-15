import { Arg, Query, Resolver } from "type-graphql";

import { InstitutionEntity as Institution } from "../entities/institution.entity";
import { InstitutionSchema } from "../../schemas/institution.schema";

@Resolver()
class InstitutionResolver {
  @Query((_returns) => Institution, { nullable: false })
  async returnInstitutionByName(@Arg("name") name: string) {
    return await InstitutionSchema.find({ name });
  }

  @Query(() => [Institution])
  async returnAllInstitutions() {
    return await InstitutionSchema.find();
  }
}

export { InstitutionResolver };
