import "mocha";

import { client, chai } from "../mocha_globals";
import * as TestData from "../../test_data/data";

const { expect } = chai;

describe("Get landlord", () => {
  it("should return landlord", () => {
    const landlord = TestData.landlords[0];

    return client.get(`/api/landlords/${landlord._id}`).then((res) => {
      expect(res.body).to.eql({ success: true, ...landlord });
    });
  });
});
