"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const axios_1 = __importDefault(require("axios"));
const graphql_1 = require("graphql");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3000;
const sourceId = 30885;
// Requests to get information
function getPerformanceId(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Prices?expandPerformancePriceType=&includeOnlyBasePrice=&modeOfSaleId=26&priceTypeId=&sourceId=${sourceId}`);
            const priceInfo = response.data;
            if (priceInfo.length > 0) {
                return priceInfo[0].PerformanceId;
            }
            return [];
        }
        catch (error) {
            console.error(error);
            return undefined;
        }
    });
}
function getZoneInfo(performanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://my.laphil.com/en/rest-proxy/TXN/Performances/ZoneAvailabilities?performanceIds=${performanceId}`);
            const resp = response.data;
            if (resp) {
                return resp;
            }
            return [];
        }
        catch (error) {
            console.error(error);
            return undefined;
        }
    });
}
function getPriceInfo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Prices?expandPerformancePriceType=&includeOnlyBasePrice=&modeOfSaleId=26&priceTypeId=&sourceId=${sourceId}`);
            const Prices = response.data.filter((obj) => obj && obj.PerformanceId === 0);
            if (Prices) {
                return Prices;
            }
            return [];
        }
        catch (error) {
            console.error(error);
            return undefined;
        }
    });
}
// GraphQL Schema
const schema = (0, graphql_1.buildSchema)(`
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
// Root resolver for GraphQL queries
const root = {
    getSeatsInfo: ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Call the function to get the event performance ID
            const performanceId = yield getPerformanceId(id);
            if (!performanceId) {
                throw new Error('Some error occurred. Performance not found. Try another event');
            }
            // Call the function to get zone information for the event
            const zoneInfo = yield getZoneInfo(performanceId);
            if (!zoneInfo) {
                throw new Error('Information about zones not found.');
            }
            // Call the function to get price information for the event
            const priceInfo = yield getPriceInfo(id);
            if (!priceInfo) {
                throw new Error('Information about prices not found.');
            }
            // Call the function to get seat information for the event
            const response = yield axios_1.default.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Seats?constituentId=0&modeOfSaleId=26&packageId=${id}`);
            const seats = response.data
                .filter((seat) => seat.SeatStatusId === 0)
                .map((seat) => {
                const zone = zoneInfo.find((zoneItem) => zoneItem.Zone.Id === seat.ZoneId);
                const price = priceInfo.find((priceItem) => priceItem.ZoneId === seat.ZoneId);
                const Price = price === null || price === void 0 ? void 0 : price.Price;
                return {
                    Section: zone ? zone.Zone.Description : 'Unknown',
                    Row: seat.SeatRow,
                    SeatNumber: seat.SeatNumber,
                    Price: Price,
                };
            });
            return seats;
        }
        catch (error) {
            console.error(error);
            throw new Error('An error occurred while fetching data.');
        }
    }),
};
// Mount the GraphQL endpoint
app.use('/graphql', (0, express_graphql_1.graphqlHTTP)({
    schema: schema,
    rootValue: root,
    graphiql: true, // Set this to false to disable the GraphiQL UI in production
}));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.query.id;
    // Handle GET request without "id" parameter
    if (!id) {
        const options = {
            root: path_1.default.join("./src/html/")
        };
        const fileName = 'index.html';
        res.sendFile(fileName, options);
        return;
    }
    try {
        // Handle GET request with "id" parameter
        // Call the function to get the event performance ID
        const performanceId = yield getPerformanceId(id);
        if (!performanceId) {
            res.status(404).json({ error: 'Some error occurred. Performance not found. Try another event' });
            return;
        }
        // Call the function to get zone information for the event
        const zoneInfo = yield getZoneInfo(performanceId);
        if (!zoneInfo) {
            res.status(404).json({ error: 'Information about zones not found.' });
            return;
        }
        // Call the function to get price information for the event
        const priceInfo = yield getPriceInfo(id);
        if (!priceInfo) {
            res.status(404).json({ error: 'Information about prices not found.' });
            return;
        }
        // Call the function to get seat information for the event
        const response = yield axios_1.default.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Seats?constituentId=0&modeOfSaleId=26&packageId=${id}`);
        const ResultSeats = response.data
            .filter((seat) => seat.SeatStatusId === 0)
            .map((seat) => {
            const zone = zoneInfo.find((zoneItem) => zoneItem.Zone.Id === seat.ZoneId);
            const price = priceInfo.find((priceItem) => priceItem.ZoneId === seat.ZoneId);
            const Price = price === null || price === void 0 ? void 0 : price.Price;
            return {
                Section: zone ? zone.Zone.Description : 'Unknown',
                Row: seat.SeatRow,
                SeatNumber: seat.SeatNumber,
                Price: Price,
            };
        });
        res.json(ResultSeats);
    }
    catch (error) {
        console.error(error);
        res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({ error: 'An error occurred while fetching data.' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
