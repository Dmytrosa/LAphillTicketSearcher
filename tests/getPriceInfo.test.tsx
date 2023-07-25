import axios from "axios";
import { getPriceInfo } from "../src/services/pricesService"
import { testResultWith_1195_30885 } from "./testdata/GetPriceTemplate";
// import {sourceId} from "../src/miniState" 

jest.mock("axios");

describe("getPriceInfo function", () => {

  //TODO: repair this 

  // it("should return the expected price info when API call is successful", async () => {
  //   const id = "1195";
  //   const sourceId = 30885;
  //   const testres = testResultWith_1195_30885
  //   const result = await getPriceInfo(id, sourceId);

  //   expect(result).toEqual(testres);
  // });

  it("should return an empty array when there are no prices available", async () => {
    const mockResponse = {
      data: [],
    };

    // @ts-ignore
    axios.get.mockResolvedValue(mockResponse);

    const id = "1195";
    const sourceId = 30885;
    const result = await getPriceInfo(id, sourceId);

    expect(result).toEqual([]);
  });

  it("should return undefined when an error occurs during API call", async () => {

    // @ts-ignore
    axios.get.mockRejectedValue(new Error("API call failed"));

    const id = "1195";
    const sourceId = 30885;
    const result = await getPriceInfo(id, sourceId);

    expect(result).toBeUndefined();
  });
});
