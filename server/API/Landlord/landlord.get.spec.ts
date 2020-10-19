import chai from "chai";
import chaiHttp = require("chai-http");
import "mocha";

import { app } from "../../server";
import * as TestData from "../../test_data/data";

chai.use(chaiHttp);

const { expect } = chai;

describe("Get landlord", () => {
  it("should return landlord", () => {
    const landlord = TestData.landlords[0];

    return chai
      .request(app)
      .get(`/api/landlords/${landlord._id}`)
      .then((res) => {
        expect(res.body).to.eql({ success: true, ...landlord });
      });
  });
});
