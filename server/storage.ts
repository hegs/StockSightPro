import { stockData, historicalData, type StockData, type InsertStockData, type HistoricalData, type InsertHistoricalData } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getStockData(symbol: string): Promise<StockData | undefined>;
  saveStockData(data: InsertStockData): Promise<StockData>;
  getHistoricalData(symbol: string): Promise<HistoricalData[]>;
  saveHistoricalData(data: InsertHistoricalData[]): Promise<HistoricalData[]>;
  clearCache(symbol?: string): Promise<void>;
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

  async clearCache(symbol?: string): Promise<void> {
    if (symbol) {
      this.stocks.delete(symbol.toUpperCase());
      this.historical.delete(symbol.toUpperCase());
    } else {
      this.stocks.clear();
      this.historical.clear();
    }
  }

  async getStockData(symbol: string): Promise<StockData | undefined> {
    return this.stocks.get(symbol.toUpperCase());
  }

  async saveStockData(insertData: InsertStockData): Promise<StockData> {
    const id = this.currentId++;
    const data: StockData = {
      id,
      symbol: insertData.symbol,
      currentPrice: insertData.currentPrice ?? null,
      marketCap: insertData.marketCap ?? null,
      volume: insertData.volume ?? null,
      peRatio: insertData.peRatio ?? null,
      change: insertData.change ?? null,
      changePercent: insertData.changePercent ?? null,
      companyName: insertData.companyName ?? null,
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
    const historicalRecords: HistoricalData[] = data.map((item) => ({
      id: this.currentId++,
      symbol,
      date: item.date,
      open: item.open ?? null,
      high: item.high ?? null,
      low: item.low ?? null,
      close: item.close ?? null,
      volume: item.volume ?? null,
      changePercent: item.changePercent ?? null,
    }));
    
    this.historical.set(symbol, historicalRecords);
    return historicalRecords;
  }
}

export class DatabaseStorage implements IStorage {
  async getStockData(symbol: string): Promise<StockData | undefined> {
    const [stock] = await db.select().from(stockData).where(eq(stockData.symbol, symbol.toUpperCase())).limit(1);
    return stock || undefined;
  }

  async saveStockData(insertData: InsertStockData): Promise<StockData> {
    // Delete existing record first, then insert new one
    await db.delete(stockData).where(eq(stockData.symbol, insertData.symbol));
    
    const [stock] = await db
      .insert(stockData)
      .values({
        symbol: insertData.symbol,
        currentPrice: insertData.currentPrice ?? null,
        marketCap: insertData.marketCap ?? null,
        volume: insertData.volume ?? null,
        peRatio: insertData.peRatio ?? null,
        change: insertData.change ?? null,
        changePercent: insertData.changePercent ?? null,
        companyName: insertData.companyName ?? null,
      })
      .returning();
    return stock;
  }

  async getHistoricalData(symbol: string): Promise<HistoricalData[]> {
    const historical = await db.select().from(historicalData).where(eq(historicalData.symbol, symbol.toUpperCase())).orderBy(historicalData.date);
    return historical;
  }

  async saveHistoricalData(data: InsertHistoricalData[]): Promise<HistoricalData[]> {
    if (data.length === 0) return [];
    
    const symbol = data[0].symbol.toUpperCase();
    
    // Delete existing historical data for this symbol
    await db.delete(historicalData).where(eq(historicalData.symbol, symbol));
    
    // Insert new historical data
    const savedData = await db
      .insert(historicalData)
      .values(data.map(item => ({
        symbol,
        date: item.date,
        open: item.open ?? null,
        high: item.high ?? null,
        low: item.low ?? null,
        close: item.close ?? null,
        volume: item.volume ?? null,
        changePercent: item.changePercent ?? null,
      })))
      .returning();
    
    return savedData;
  }

  async clearCache(symbol?: string): Promise<void> {
    if (symbol) {
      await db.delete(stockData).where(eq(stockData.symbol, symbol.toUpperCase()));
      await db.delete(historicalData).where(eq(historicalData.symbol, symbol.toUpperCase()));
    } else {
      await db.delete(stockData);
      await db.delete(historicalData);
    }
  }
}

export const storage = new DatabaseStorage();
