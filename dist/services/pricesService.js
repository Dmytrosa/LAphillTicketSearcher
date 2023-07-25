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
exports.getPriceInfo = void 0;
const axios_1 = __importDefault(require("axios"));
function getPriceInfo(id, sourceId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const nid = +id;
            const response = yield axios_1.default.get(`https://my.laphil.com/en/rest-proxy/TXN/Packages/${nid}/Prices?expandPerformancePriceType=&includeOnlyBasePrice=&modeOfSaleId=26&priceTypeId=&sourceId=${sourceId}`);
            console.log(response.data);
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
exports.getPriceInfo = getPriceInfo;
