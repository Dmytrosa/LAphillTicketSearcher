import { buildSchema } from 'graphql';


export const schema = buildSchema(`
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