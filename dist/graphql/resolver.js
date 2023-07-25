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
exports.root = void 0;
const axios_1 = __importDefault(require("axios"));
const miniState_1 = require("../miniState");
const performancesService_1 = require("../services/performancesService");
const pricesService_1 = require("../services/pricesService");
const zonesService_1 = require("../services/zonesService");
exports.root = {
    getSeatsInfo: ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Виклик функції для отримання id
            const performanceId = yield (0, performancesService_1.getPerformanceId)(id, miniState_1.sourceId);
            if (!performanceId) {
                throw new Error('Some error occurred. Performance not found. Try another event');
            }
            // Виклик функції для отримання інформації про зони залу події 
            const zoneInfo = yield (0, zonesService_1.getZoneInfo)(performanceId);
            if (!zoneInfo) {
                throw new Error('Information about zones not found.');
            }
            // Виклик функції для отримання інформації про ціни
            const priceInfo = yield (0, pricesService_1.getPriceInfo)(id, miniState_1.sourceId);
            if (!priceInfo) {
                throw new Error('Information about prices not found.');
            }
            // Виклик функції для отримання інформації про сидіння та подальше формування результуючого об'єкту
            const response = yield axios_1.default.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${id}/Seats?constituentId=0&modeOfSaleId=26&packageId=${id}`);
            const seats = response.data
                .filter((seat) => seat.SeatStatusId === 0)
                .map((seat) => {
                const zone = zoneInfo.find((zoneItem) => zoneItem.Zone.Id === seat.ZoneId);
                const price = priceInfo.find((priceItem) => priceItem.ZoneId === seat.ZoneId);
                console.log(price);
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
