import chai from "chai";
import "mocha";
import * as _ from "lodash";

import faker from 'faker';
import { gql } from "apollo-server-express";
import { apolloServerTestClient } from "./mocha_globals";

import * as TestData from "../test_data/data";
import {Landlord, LandlordAPIResponse} from '../GQL/entities/Landlord';

const { expect } = chai;


describe("🧪 getLandlord", () => {
  it("Retrieve the landlord data", async () => {
    const { query } = apolloServerTestClient;
    const expected_landlord: Landlord = TestData.randomSample<Landlord>({of: TestData.landlords});

    const response = await query<{getLandlord: LandlordAPIResponse}>({
      query: gql`
        query GetLandlordById($id: String!) {
          getLandlord(_id: $id) {success, error, data {_id, first_name, last_name} } }`,
      variables: { id: expected_landlord._id },
    });

    expect(response.data, "Retrieving landlord yielded in undefined response").to.not.be.undefined;
    expect(response.data!.getLandlord.success, `Failed to retrieve landlord with id ${expected_landlord._id}`).to.be.true;
    expect(response.data!.getLandlord.error, "Error returned when retrieving landlord").to.be.null;
    expect(response.data!.getLandlord.data).to.eql(_.pick(expected_landlord, ["_id", "first_name", "last_name"]));
  });
});

describe("🧪 updatePhoneNumber", () => {
  it ("Should update the phone number of the landlord", async () => {
    const {mutate} = apolloServerTestClient;

    const landlord: Landlord = TestData.randomSample<Landlord>({of: TestData.landlords});
    let new_phone_number: string;
    
    do { new_phone_number = faker.phone.phoneNumber("+1##########");}
    while(landlord.phone_number == new_phone_number)

    expect(landlord.phone_number, "New phone number generated is not different from the landlord's phone number")
    .to.not.equal(new_phone_number);

    const response = await mutate<{updatePhoneNumber: LandlordAPIResponse}>({
      mutation: gql`
        mutation UpdatePhoneNumber($landlord_id: String!, $phone_number: String!) {
          updatePhoneNumber(landlord_id:$landlord_id, phone_number:$phone_number) {
            success, error, data { phone_number, _id }
          }}`,
      variables: {
        landlord_id: landlord._id, phone_number: new_phone_number
      }
    })

    // Test assertions
    expect(response.data, "Update landlord phone number yielded undefined response").to.not.be.undefined;
    expect(response.data!.updatePhoneNumber.error, "Updating landlord phone number yielded error").to.be.null;
    expect(response.data!.updatePhoneNumber.success, "Updating landlord phone number was nut successful").to.be.true;
    expect(response.data!.updatePhoneNumber.data, "Updating landlord phoen number yielded null data").to.not.be.null;
    expect(response.data!.updatePhoneNumber.data!.phone_number, "New phone number was not updated for landlord  ").to.equal(new_phone_number);
  })
})