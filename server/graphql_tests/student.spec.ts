import chai from "chai";
import "mocha";

import { gql } from "apollo-server-express";
import { apolloServerTestClient } from "./mocha_globals";

import * as TestData from "../test_data/data";
import {Student, 
    StudentAPIResponse, 
    PropertyCollectionEntriesAPIResponse} from '../GQL/entities/Student';
import {Property} from '../GQL/entities/Property';
const { expect } = chai;

/**
 * Student Resolver Tests
*/


describe("🧪 addPropertyToStudentCollection", () => {
    it("Add a property not in their collection to their collection", async() => {
        const {mutate} = apolloServerTestClient;
        
        let expected_student: Student = TestData.randomSample<Student>({of: TestData.students});
        // find a property that is not in the student's collection yet
        let property_to_add: Property;
        do {
            property_to_add = TestData.randomSample<Property>({of: TestData.properties});
        } while (expected_student.saved_collection.includes( property_to_add._id ))

        expect(expected_student.saved_collection, "Initial student already has the property we want to add to their collection")
            .to.not.include(property_to_add._id)
        // initiate the AddCollection mutation
        const response = await mutate<{
            addPropertyToStudentCollection: PropertyCollectionEntriesAPIResponse
         }>({
             mutation: gql`
                mutation AddCollection($student_id: String!, $property_id: String!) {
                    addPropertyToStudentCollection(student_id:$student_id,property_id:$property_id) {
                        success, error, data { collection_entries { _id } } } }`,
             variables: {
                student_id: expected_student._id,
                property_id: property_to_add._id
             }
         })

         // assertions
         expect(response.data, "Data response is undefined.").to.not.be.undefined;
         expect(response.data!.addPropertyToStudentCollection.success, "Mutation response is not a success").to.be.true;
         expect(response.data!.addPropertyToStudentCollection.data, "Student data in response is undefined").to.not.be.undefined;
         expect(response.data!.addPropertyToStudentCollection.error, "Error was returned when none should have").to.be.null;
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
                        success, error, data { collection_entries { _id } } } }`,
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
                        success, error, data { collection_entries { _id } } } }`,
             variables: {
                student_id: expected_student._id,
                property_id: property_to_add._id
             }
         })

         // assertions
         expect(response.data, "Data response is undefined.").to.not.be.undefined;
         expect(response.data!.addPropertyToStudentCollection.success, "Mutation was successfully when it should have failed").to.be.false;
         expect(response.data!.addPropertyToStudentCollection.data, "StudentCollection data was returned when it should have been undefined").to.be.null;
         expect(response.data!.addPropertyToStudentCollection.error).to.not.be.undefined;
    })
})

describe("🧪 removePropertyFromStudentCollection", () => {
    it("Remove a property, which is in the student's collection, from their collection", async() => {
        const {mutate} = apolloServerTestClient;

        // Setup 
        let expected_student: Student = TestData.randomSample<Student>({of: TestData.students});

        let property_to_add: Property;
        do {
            property_to_add = TestData.randomSample<Property>({of: TestData.properties});
        } while (expected_student.saved_collection.includes( property_to_add._id ))

        expect(expected_student.saved_collection, "Initial student already has the property we want to add to their collection")
        .to.not.include(property_to_add._id)

        // Pre-Work: Add the property to their collection
        let response = await mutate<{addPropertyToStudentCollection: PropertyCollectionEntriesAPIResponse}>({
            mutation: gql`
            mutation AddCollection($student_id: String!, $property_id: String!) {
                addPropertyToStudentCollection(student_id:$student_id,property_id:$property_id) {
                    success, error, data { collection_entries { _id } } } }`,
            variables: {
                student_id: expected_student._id,
                property_id: property_to_add._id
            }
        })
        // End Pre-Work

        expect(response.data, "Initial collection add yielded undefined response").to.not.be.undefined;
        expect(response.data!.addPropertyToStudentCollection.error, "Error occurred in initial collection add").to.be.null;
        expect(response.data!.addPropertyToStudentCollection.success, "Initial collection add was unsuccessful").to.be.true;
        expect(response.data!.addPropertyToStudentCollection.data, "Initial collection add yielded null data").to.not.be.null;
        expect(response.data!.addPropertyToStudentCollection.data!.collection_entries.map((entry: Partial<Property>) => entry._id), 
            "Initial collection add did not add the property to collection").to.include(property_to_add._id);

        // Mutate & Test
        {
            let response = await mutate<{removePropertyFromStudentCollection: PropertyCollectionEntriesAPIResponse}>({
                mutation: gql`
                mutation RemoveFromCollection($student_id: String!, $property_id: String!) {
                    removePropertyFromStudentCollection(student_id:$student_id, property_id:$property_id) {
                        success, error, data { collection_entries { _id } } } }`,
                variables: {
                    student_id: expected_student._id,
                    property_id: property_to_add._id
                }
                    
            })

            expect(response.data, "Remove from collection yielded undfined response").to.not.be.undefined;
            expect(response.data!.removePropertyFromStudentCollection.error, "Remove from collection yielded error").to.be.null;
            expect(response.data!.removePropertyFromStudentCollection.success, "Removing from collection was unsuccessful").to.be.true;
            expect(response.data!.removePropertyFromStudentCollection.data, "Removing from collection yielded null data").to.not.be.null;
            expect(response.data!.removePropertyFromStudentCollection.data!.collection_entries, "Remove from collection did not remove the property from collection")
            .to.not.include(property_to_add._id);
        }

    })

    it("Remove a property, which is NOT in the student's collection, from their collection", async() => {
        const {mutate} = apolloServerTestClient;

        // Setup 
        let expected_student: Student = TestData.randomSample<Student>({of: TestData.students});
        let property_to_add: Property;
        do {
            property_to_add = TestData.randomSample<Property>({of: TestData.properties});
        } while (expected_student.saved_collection.includes( property_to_add._id ))

        expect(expected_student.saved_collection, "Initial student already has the property we want to add to their collection")
        .to.not.include(property_to_add._id)

        // Mutate & Test
        let response = await mutate<{removePropertyFromStudentCollection: PropertyCollectionEntriesAPIResponse}>({
            mutation: gql`
            mutation RemoveFromCollection($student_id: String!, $property_id: String!) {
                removePropertyFromStudentCollection(student_id:$student_id, property_id:$property_id) {
                    success, error, data { collection_entries { _id } } } }`,
            variables: {
                student_id: expected_student._id,
                property_id: property_to_add._id
            }
                
        })

        expect(response.data, "Remove from collection yielded undfined response").to.not.be.undefined;
        expect(response.data!.removePropertyFromStudentCollection.error, "Remove from collection yielded error").to.be.null;
        expect(response.data!.removePropertyFromStudentCollection.success, "Removing from collection was unsuccessful").to.be.true;
        expect(response.data!.removePropertyFromStudentCollection.data, "Removing from collection yielded null data").to.not.be.null;
        expect(response.data!.removePropertyFromStudentCollection.data!.collection_entries, "Remove from collection did not remove the property from collection")
        .to.not.include(property_to_add._id);
        

    })
})


describe("🧪 updateStudent", () => {
    it("Remove a property, which is NOT in the student's collection, from their collection", async() => {
        const {mutate} = apolloServerTestClient;

        let initial_student: Student = TestData.randomSample<Student>({of: TestData.students});
        let new_first_name = initial_student.first_name + "_updated";
        let new_last_name = initial_student.last_name + "_updated";
        let new_email = initial_student.email + "_updated";

        expect(initial_student.first_name).to.not.eq(new_first_name);
        expect(initial_student.last_name).to.not.eq(new_last_name);
        expect(initial_student.email).to.not.eq(new_email);

        let response = await mutate<{updateStudent: StudentAPIResponse}>({
            mutation: gql`
            mutation UpdateStudentInfo($_id: String!, $new_first_name: String, $new_last_name: String, $new_email: String){
                updateStudent(_id:$_id, new_student:{first_name: $new_first_name, last_name: $new_last_name, email: $new_email}){
                    success, error, data {first_name, last_name, email}
                }
            }`,
            variables: { _id: initial_student._id, new_first_name, new_last_name, new_email }
        })

        expect(response.data, "Update student yielded undefined response").to.not.be.undefined;
        expect(response.data!.updateStudent.error, "Error was returned when none was expected").to.be.null;
        expect(response.data!.updateStudent.success, "Update student was unsuccessful").to.be.true;
        expect(response.data!.updateStudent.data, "Update student data is null").to.not.be.null;
        
        // check new information
        expect(response.data!.updateStudent.data!.first_name).to.not.eq(initial_student.first_name);
        expect(response.data!.updateStudent.data!.last_name).to.not.eq(initial_student.last_name);
        expect(response.data!.updateStudent.data!.email).to.not.eq(initial_student.email);

        expect(response.data!.updateStudent.data!.first_name).to.eq(new_first_name);
        expect(response.data!.updateStudent.data!.last_name).to.eq(new_last_name);
        expect(response.data!.updateStudent.data!.email).to.eq(new_email);
    })
})