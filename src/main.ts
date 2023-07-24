import express, { Request, Response } from 'express';
import { graphqlHTTP } from 'express-graphql';
import axios from 'axios';
import { buildSchema } from 'graphql';
import path from 'path';

const app = express();
const PORT = 3000;
const sourceId = 30885;

// Інтерфейси
interface SeatInfo {
  SeatNumber: string;
  SeatRow: string;
  SeatStatusId: number;
  ZoneId: number;
}
interface ZoneInfo {
  Zone: {
    Id: number;
    Description: string;
  };
}
interface PriceInfo {
  PerformanceId: number;
  ZoneId: number;
  Price: number;
}

// Запити для отримання даних
async function getPerformanceId(id: string): Promise<number | [] | undefined> {
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

async function getZoneInfo(performanceId: number | []): Promise<ZoneInfo[] | undefined> {
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

async function getPriceInfo(id: string): Promise<PriceInfo[] | undefined> {
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

// Схема для запиту GrapfQl
const schema = buildSchema(`
  type SeatInfo {
    Section: String
    Row: String
    SeatNumber: String
    Price: Float
  }

  type Query {
    getSeatsInfo(id: String!): [SeatInfo]
  }
`);


// Кореневий об'єкт для GraphQL
const root = {
  getSeatsInfo: async ({ id }: { id: string }) => {
    try {
      // Call the function to get the event performance ID
      const performanceId = await getPerformanceId(id);
      if (!performanceId) {
        throw new Error('Some error occurred. Performance not found. Try another event');
      }

      // Call the function to get zone information for the event
      const zoneInfo = await getZoneInfo(performanceId);
      if (!zoneInfo) {
        throw new Error('Information about zones not found.');
      }

      // Call the function to get price information for the event
      const priceInfo = await getPriceInfo(id);
      if (!priceInfo) {
        throw new Error('Information about prices not found.');
      }

      // Call the function to get seat information for the event
      const response = await axios.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Seats?constituentId=0&modeOfSaleId=26&packageId=${id}`);
      const seats: SeatInfo[] = response.data
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

      return seats;
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while fetching data.');
    }
  },
};


// Ініціалізація ендпоїнту для GraphQL
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Set this to false to disable the GraphiQL UI in production
  })
);

//Обробка get запиту 
app.get('/', async (req: Request, res: Response) => {
  const id = req.query.id as string;

  //Обробка get запиту без id
  if (!id) {
    const options = {
      root: path.join("./src/html/")
    };
    const fileName = 'index.html';
    res.sendFile(fileName, options);
    return;
  }

//Обробка get запиту з id
  try {
    //Виклики функцій для отримання даних
    const performanceId = await getPerformanceId(id);
    if (!performanceId) {
      res.status(404).json({ error: 'Some error occurred. Performance not found. Try another event' });
      return;
    }

    const zoneInfo = await getZoneInfo(performanceId);
    if (!zoneInfo) {
      res.status(404).json({ error: 'Information about zones not found.' });
      return;
    }

    const priceInfo = await getPriceInfo(id);
    if (!priceInfo) {
      res.status(404).json({ error: 'Information about prices not found.' });
      return;
    }

    //Основний запит та обробка даних
    const response = await axios.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Seats?constituentId=0&modeOfSaleId=26&packageId=${id}`);
    const ResultSeats: SeatInfo[] = response.data
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

    res.json(ResultSeats);
  } catch (error: any) {
    console.error(error);
    res.status(error.response?.status || 500).json({ error: 'An error occurred while fetching data.' });
  }
});

//Відкриття порту
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
