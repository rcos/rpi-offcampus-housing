import chai from "chai";
import "mocha";
import * as _ from "lodash";

import { gql } from "apollo-server-express";
import { apolloServerTestClient } from "./mocha_globals";

import * as TestData from "../test_data/data";
import {Student, 
    StudentAPIResponse, 
    PropertyCollectionEntriesAPIResponse,
    PropertyCollectionEntries} from '../GQL/entities/Student';
import {Property} from '../GQL/entities/Property';
const { expect } = chai;

/**
 * Student Resolver Tests
*/

/**
 * addPropertyToStudentCollection()::TEST_1
 * @desc Add an existing property to the collection.
 */
describe("Save property for student", () => {
    it("should add a property to the student collection", async() => {
        
        const {mutate} = apolloServerTestClient;
        
        let expected_student: Student = TestData.randomSample<Student>({of: TestData.students});
        // find a property that is not in the student's collection yet
        let property_to_add: Property;
        do {
            property_to_add = TestData.randomSample<Property>({of: TestData.properties});
        } while (expected_student.saved_collection.includes( property_to_add._id ))

        // initiate the AddCollection mutation
        const response = await mutate<{
            addPropertyToStudentCollection: PropertyCollectionEntriesAPIResponse
         }>({
             mutation: gql`
                mutation AddCollection($student_id: String!, $property_id: String!) {
                    addPropertyToStudentCollection(student_id:$student_id,property_id:$property_id) {
                        success
                        error
                        data {
                            collection_entries {
                                _id
                            }
                        }
                    }
            }
             `,
             variables: {
                student_id: expected_student._id,
                property_id: property_to_add._id
             }
         })

         // assertions
         console.log("Response");
         console.log(response);
         expect(response.data != null, "Data response is null.").to.be.true;
         expect(response.data!.addPropertyToStudentCollection.success, "Mutation response is not a success").to.be.true;
         expect(response.data!.addPropertyToStudentCollection.data != null, "Student data in response is undefined").to.be.true;
         let new_collection: Partial<Property>[] = response.data!.addPropertyToStudentCollection.data!.collection_entries;
         expect(new_collection
            .map((collection_: Partial<Property>) => collection_._id).includes(property_to_add._id),
            "Property was not added to the student's collection")
            .to.be.true;
    })
    // const expected_student 
})