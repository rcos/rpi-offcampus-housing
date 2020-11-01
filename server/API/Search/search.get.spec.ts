import "mocha";

import { client, chai } from "../mocha_globals";
import * as TestData from "../../test_data/data";

const { expect } = chai;

describe("Search properties", () => {
  it("should filter properties by number of rooms with offset and limit", () => {
    const rooms = TestData.properties[0].rooms;
    const offset = 2;
    const limit = 10;

    const filteredProperties = TestData.properties.filter(
      (property) => property.rooms === rooms
    );
    const properties = filteredProperties
      .sort((left, right) => left._id.localeCompare(right._id))
      .slice(offset, offset + limit);

    return client
      .get(`/api/search/properties`)
      .query({ filters: { rooms }, offset, limit })
      .then(({ body }) => {
        expect(body.success).to.equal(true, body.error);
        expect(body.count).to.equal(filteredProperties.length);
        expect(body.properties).to.eql(properties);
      });
  });

  it("should filter properties by min price", () => {
    const minPrice = TestData.properties[0].price;
    const offset = 0;
    const limit = 10;

    const filteredProperties = TestData.properties.filter(
      (property) => property.price >= minPrice
    );
    const properties = filteredProperties
      .sort((left, right) => left._id.localeCompare(right._id))
      .slice(offset, offset + limit);

    return client
      .get(`/api/search/properties`)
      .query({ filters: { price: { minimum: minPrice } }, offset, limit })
      .then(({ body }) => {
        expect(body.success).to.equal(true, body.error);
        expect(body.count).to.equal(filteredProperties.length);
        expect(body.properties).to.eql(properties);
      });
  });

  it("should filter properties by min and max price", () => {
    const minPrice = 500;
    const maxPrice = 1000;
    const offset = 0;
    const limit = 10;

    const filteredProperties = TestData.properties.filter(
      (property) => property.price >= minPrice && property.price <= maxPrice
    );
    const properties = filteredProperties
      .sort((left, right) => left._id.localeCompare(right._id))
      .slice(offset, offset + limit);

    return client
      .get(`/api/search/properties`)
      .query({
        filters: { price: { minimum: minPrice, maximum: maxPrice } },
        offset,
        limit,
      })
      .then(({ body }) => {
        expect(body.success).to.equal(true, body.error);
        expect(body.count).to.equal(filteredProperties.length);
        expect(body.properties).to.eql(properties);
      });
  });
});
