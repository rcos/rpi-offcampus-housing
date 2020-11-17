/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TestQuery
// ====================================================

export interface TestQuery_getStudent_data_auth_info {
  __typename: "CasAuthInfo";
  cas_id: string | null;
  institution_id: string | null;
}

export interface TestQuery_getStudent_data {
  __typename: "Student";
  auth_info: TestQuery_getStudent_data_auth_info | null;
  email: string;
  first_name: string;
  last_name: string;
}

export interface TestQuery_getStudent {
  __typename: "StudentAPIResponse";
  data: TestQuery_getStudent_data | null;
}

export interface TestQuery {
  getStudent: TestQuery_getStudent;
}

export interface TestQueryVariables {
  id: string;
}
