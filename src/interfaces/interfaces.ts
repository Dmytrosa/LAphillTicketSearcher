export interface PriceInfo {
    PerformanceId: number;
    ZoneId: number;
    Price: number;
  }
export interface ZoneInfo {
    Zone: {
      Id: number;
      Description: string;
    };
  }
export interface SeatInfo {
    SeatNumber: string;
    SeatRow: string;
    SeatStatusId: number;
    ZoneId: number;
    sourceId: number;
  }