import axios from 'axios';
import { SeatInfo } from '../interfaces/interfaces';
import { sourceId } from '../miniState';
import { getPerformanceId } from './performancesService';
import { getPriceInfo } from './pricesService';
import { getZoneInfo } from './zonesService';

export class SeatsService {
  async getSeatsInfo(id: string): Promise<SeatInfo[]> {
    const performanceId = await getPerformanceId(id, sourceId); // Виклик зовнішньої функції
    if (!performanceId) {
      throw new Error('Some error occurred. Performance not found. Try another event');
    }

    const zoneInfo = await getZoneInfo(performanceId); // Виклик зовнішньої функції
    if (!zoneInfo) {
      throw new Error('Information about zones not found.');
    }

    const priceInfo = await getPriceInfo(id, sourceId); // Виклик зовнішньої функції
    if (!priceInfo) {
      throw new Error('Information about prices not found.');
    }

    const response = await axios.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Seats?constituentId=0&modeOfSaleId=26&packageId=${id}`);
    const resultSeats: SeatInfo[] = response.data
      .filter((seat: SeatInfo) => seat.SeatStatusId === 0)
      .map((seat: SeatInfo) => {
        const zone = zoneInfo.find((zoneItem) => zoneItem.Zone.Id === seat.ZoneId);
        const price = priceInfo.find((priceItem) => priceItem.ZoneId === seat.ZoneId);
        const Price = price?.Price;
        return {
          Section: zone ? zone.Zone.Description : 'Unknown',
          Row: seat.SeatRow,
          SeatNumber: seat.SeatNumber,
          Price: Price,
        };
      });

    return resultSeats;
  }
}
