import chai from "chai";
import "mocha";
import * as _ from "lodash";

import { gql } from "apollo-server-express";
import { apolloServerTestClient } from "./mocha_globals";

import * as TestData from "../test_data/data";

const { expect } = chai;

describe("get landlord", () => {
  it("should get first and last name", async () => {
    const { query, mutate } = apolloServerTestClient;

    const expected_landlord = TestData.landlords[0];

    const response = await query<{
      getLandlord: {
        success: boolean;
        data: { first_name: string; last_name: string };
      };
    }>({
      query: gql`
        query GetLandlordById($id: String!) {
          getLandlord(_id: $id) {
            success
            data {
              first_name
              last_name
            }
          }
        }
      `,
      variables: { id: expected_landlord._id },
    });

    expect(response.data!.getLandlord.success).to.be.true;
    expect(response.data!.getLandlord.data).to.eql(
      _.pick(expected_landlord, ["first_name", "last_name"])
    );
  });
});
