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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeatsInfo = void 0;
const seatsService_1 = require("../services/seatsService");
const seatsService = new seatsService_1.SeatsService();
function getSeatsInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.query.id;
            if (!id) {
                res.status(400).json({ error: 'Invalid request. Missing "id" parameter.' });
                return;
            }
            const resultSeats = yield seatsService.getSeatsInfo(id);
            res.json(resultSeats);
        }
        catch (error) {
            console.error(error);
            res.status(error.status || 500).json({ error: 'An error occurred while fetching data.' });
        }
    });
}
exports.getSeatsInfo = getSeatsInfo;
