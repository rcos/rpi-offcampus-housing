import chai from "chai";
import "mocha";
import * as _ from "lodash";

import bcrypt from 'bcrypt';
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

describe("🧪 createLandlord", () => {
  it("Should create a new landlord", async () => {
    const {mutate} = apolloServerTestClient;

    let new_landlord: 
    {first_name: string, last_name: string, email: string, password: string};
    do {
      let f_name = faker.name.firstName (), l_name = faker.name.lastName ();
      new_landlord = {
        first_name: f_name,
        last_name: l_name,
        email: `/\\fake_offcmpus_email@+${faker.internet.email(f_name, l_name)}`,
        password: faker.internet.password()
      };
    } while (TestData.landlords.find((landlord_: Landlord) => landlord_.email == new_landlord.email) != undefined)

    // Create the landlord
    const response = await mutate<{createLandlord: LandlordAPIResponse}>({
      mutation: gql`
        mutation CreateLandlord($first_name: String!, $last_name: String!, $email: String!, $password: String!) {
          createLandlord(new_landlord:{first_name:$first_name, last_name:$last_name, email: $email, password: $password}) {
            success, error, data { _id, first_name, last_name, email, password }
          }
        }
      `,
      variables: {
        first_name: new_landlord.first_name, last_name: new_landlord.last_name,
        email: new_landlord.email, password: new_landlord.password}
    });

    // Test checks
    expect(response.data, "Create landlord response yielded undefined response").to.not.be.undefined;
    expect(response.data!.createLandlord.error, "Create landlord response returned an error").to.be.null;
    expect(response.data!.createLandlord.success, "Creating landlord was unsuccessful").to.be.true;
    expect(response.data!.createLandlord.data, "No data returned from creating landlord").to.not.be.null;
    expect(response.data!.createLandlord.data!.first_name, "The created lanslord's first name is wrong").to.equal(new_landlord.first_name);
    expect(response.data!.createLandlord.data!.last_name, "The created lanslord's last name is wrong").to.equal(new_landlord.last_name);
    expect(response.data!.createLandlord.data!.email, "The created lanslord's email is wrong").to.equal(new_landlord.email);
    let passwords_match: boolean = await bcrypt.compare(new_landlord.password, response.data!.createLandlord.data!.password!);
    expect(passwords_match, "The new landlord's hashed password is incorrect").to.be.true;
  })

  it("Should try to create a landlord that already exists", async () => {
    const {mutate} = apolloServerTestClient;

    let new_landlord = TestData.randomSample<Landlord>({of: TestData.landlords})

    // Create the landlord
    const response = await mutate<{createLandlord: LandlordAPIResponse}>({
      mutation: gql`
        mutation CreateLandlord($first_name: String!, $last_name: String!, $email: String!, $password: String!) {
          createLandlord(new_landlord:{first_name:$first_name, last_name:$last_name, email: $email, password: $password}) {
            success, error, data { _id, first_name, last_name, email, password }
          }
        }
      `,
      variables: {
        first_name: new_landlord.first_name, last_name: new_landlord.last_name,
        email: new_landlord.email, password: new_landlord.password}
    });

    // Test checks
    expect(response.data, "Create landlord response yielded undefined response").to.not.be.undefined;
    expect(response.data!.createLandlord.error, "Create existing landlord response did NOT return an error, when it is expecting an error")
    .to.not.be.null;
    expect(response.data!.createLandlord.success, "Creating existing landlord was successful, when it should have failed").to.be.false;
    expect(response.data!.createLandlord.data, "Data was returned when none sohuld have").to.be.null;
  })
})