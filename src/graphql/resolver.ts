import axios from "axios";
import { SeatInfo } from "../interfaces/interfaces";
import { sourceId } from "../miniState";
import { getPerformanceId } from "../services/performancesService";
import { getPriceInfo } from "../services/pricesService";
import { getZoneInfo } from "../services/zonesService";

export const root ={
    
    getSeatsInfo: async ({ id }: { id: string }) => {
      try {
        // Виклик функції для отримання id
        const performanceId = await getPerformanceId(id, sourceId);
        if (!performanceId) {
          throw new Error('Some error occurred. Performance not found. Try another event');
        }
  
        // Виклик функції для отримання інформації про зони залу події 
        const zoneInfo = await getZoneInfo(performanceId);
        if (!zoneInfo) {
          throw new Error('Information about zones not found.');
        }
  
        // Виклик функції для отримання інформації про ціни
        const priceInfo = await getPriceInfo(id, sourceId);
        
        if (!priceInfo) {
          throw new Error('Information about prices not found.');
        }
  
        // Виклик функції для отримання інформації про сидіння та подальше формування результуючого об'єкту
        const response = await axios.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Seats?constituentId=0&modeOfSaleId=26&packageId=${id}`);
        const seats: SeatInfo[] = response.data
          .filter((seat: SeatInfo) => seat.SeatStatusId === 0)
          .map((seat: SeatInfo) => {
            const zone = zoneInfo.find((zoneItem) => zoneItem.Zone.Id === seat.ZoneId);
            const price = priceInfo.find((priceItem) => priceItem.ZoneId === seat.ZoneId);
            console.log(price)
            const Price = price?.Price;
            return {
              Section: zone ? zone.Zone.Description : 'Unknown',
              Row: seat.SeatRow,
              SeatNumber: seat.SeatNumber,
              Price: Price,
            };
          });
  
        return seats;
      } catch (error) {
        console.error(error);
        throw new Error('An error occurred while fetching data.');
      }
    },
  };