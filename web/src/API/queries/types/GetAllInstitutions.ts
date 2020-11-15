/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAllInstitutions
// ====================================================

export interface GetAllInstitutions_returnAllInstitutions_location {
  __typename: "LocationEntity";
  address: string;
}

export interface GetAllInstitutions_returnAllInstitutions {
  __typename: "InstitutionEntity";
  name: string;
  location: GetAllInstitutions_returnAllInstitutions_location;
}

export interface GetAllInstitutions {
  returnAllInstitutions: GetAllInstitutions_returnAllInstitutions[];
}
