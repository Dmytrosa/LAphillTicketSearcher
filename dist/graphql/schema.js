"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
exports.schema = (0, graphql_1.buildSchema)(`
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
