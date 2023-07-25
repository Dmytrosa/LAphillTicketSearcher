import axios from "axios";
import { ZoneInfo } from "../interfaces/interfaces";

export async function getZoneInfo(performanceId: number | []): Promise<ZoneInfo[] | undefined> {
    try {
      const response = await axios.get(`https://my.laphil.com/en/rest-proxy/TXN/Performances/ZoneAvailabilities?performanceIds=${performanceId}`);
      const resp = response.data;
      if (resp) {
        return resp;
      }
      return [];
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }