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


describe("🧪 Add property to student's collection", () => {
    it("Add a property not in their collection to their collection", async() => {
        
        const {mutate} = apolloServerTestClient;
        
        let expected_student: Student = TestData.randomSample<Student>({of: TestData.students});
        // find a property that is not in the student's collection yet
        let property_to_add: Property;
        do {
            property_to_add = TestData.randomSample<Property>({of: TestData.properties});
        } while (expected_student.saved_collection.includes( property_to_add._id ))

        // expect(expected_student.saved_collection, "Initial student already has the property we want to add to their collection")
        //     .to.not.include(property_to_add._id)
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
         expect(response.data != undefined, "Data response is undefined.").to.be.true;
         expect(response.data!.addPropertyToStudentCollection.success, "Mutation response is not a success").to.be.true;
         expect(response.data!.addPropertyToStudentCollection.data, "Student data in response is undefined").to.not.be.undefined;
         expect(response.data!.addPropertyToStudentCollection.error, "Error was returned when none should have").to.be.undefined;
         let new_collection: Partial<Property>[] = response.data!.addPropertyToStudentCollection.data!.collection_entries;
         expect(new_collection
            .map((collection_: Partial<Property>) => collection_._id).includes(property_to_add._id),
            "Property was not added to the student's collection")
            .to.be.true;
    })
    
    it("Add a property that is already in their collection to their collection", async() => {
        
        const {mutate} = apolloServerTestClient;
        
        let expected_student: Student = TestData.randomSample<Student>({of: TestData.students});
        // find a property that is not in the student's collection yet
        let property_to_add: Property;
        do {
            property_to_add = TestData.randomSample<Property>({of: TestData.properties});
        } while (expected_student.saved_collection.includes( property_to_add._id ))

        // (1) add the property to their collection
        await mutate<{
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

         // (2) Try to add the property to their collection again
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
         expect(response.data == undefined, "Data response is undefined.").to.be.true;
         expect(response.data!.addPropertyToStudentCollection.success, "Mutation was successfully when it should have failed").to.be.false;
         expect(response.data!.addPropertyToStudentCollection.data, "StudentCollection data was returned when it should have been undefined").to.be.undefined;
         expect(response.data!.addPropertyToStudentCollection.error).to.not.be.undefined;
    })
})