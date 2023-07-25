import axios from "axios";
import { PriceInfo } from "../interfaces/interfaces";


export async function getPerformanceId(id: string, sourceId: number): Promise<number | [] | undefined> {
    try {
      const response = await axios.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Prices?expandPerformancePriceType=&includeOnlyBasePrice=&modeOfSaleId=26&priceTypeId=&sourceId=${sourceId}`);
      const priceInfo: PriceInfo[] = response.data;
      if (priceInfo.length > 0) {
        return priceInfo[0].PerformanceId;
      }
      return [];
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }