import { stockData, historicalData, type StockData, type InsertStockData, type HistoricalData, type InsertHistoricalData } from "@shared/schema";

export interface IStorage {
  getStockData(symbol: string): Promise<StockData | undefined>;
  saveStockData(data: InsertStockData): Promise<StockData>;
  getHistoricalData(symbol: string): Promise<HistoricalData[]>;
  saveHistoricalData(data: InsertHistoricalData[]): Promise<HistoricalData[]>;
}

export class MemStorage implements IStorage {
  private stocks: Map<string, StockData>;
  private historical: Map<string, HistoricalData[]>;
  private currentId: number;

  constructor() {
    this.stocks = new Map();
    this.historical = new Map();
    this.currentId = 1;
  }

  async getStockData(symbol: string): Promise<StockData | undefined> {
    return this.stocks.get(symbol.toUpperCase());
  }

  async saveStockData(insertData: InsertStockData): Promise<StockData> {
    const id = this.currentId++;
    const data: StockData = {
      ...insertData,
      id,
      lastUpdated: new Date(),
    };
    this.stocks.set(insertData.symbol.toUpperCase(), data);
    return data;
  }

  async getHistoricalData(symbol: string): Promise<HistoricalData[]> {
    return this.historical.get(symbol.toUpperCase()) || [];
  }

  async saveHistoricalData(data: InsertHistoricalData[]): Promise<HistoricalData[]> {
    if (data.length === 0) return [];
    
    const symbol = data[0].symbol.toUpperCase();
    const historicalRecords: HistoricalData[] = data.map((item, index) => ({
      ...item,
      id: this.currentId++,
      symbol,
    }));
    
    this.historical.set(symbol, historicalRecords);
    return historicalRecords;
  }
}

export const storage = new MemStorage();
