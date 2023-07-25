import axios from "axios";
import { PriceInfo } from "../interfaces/interfaces";

export async function getPriceInfo(id: string, sourceId: number): Promise<PriceInfo[] | undefined> {
    try {
      const response = await axios.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Prices?expandPerformancePriceType=&includeOnlyBasePrice=&modeOfSaleId=26&priceTypeId=&sourceId=${sourceId}`);
      
      const Prices: PriceInfo[] = response.data.filter((obj: PriceInfo) => obj && obj.PerformanceId === 0);

      if (Prices) {

        return Prices;
      }
      return [];
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

 