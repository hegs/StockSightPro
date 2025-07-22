import { pgTable, text, serial, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stockData = pgTable("stock_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  currentPrice: text("current_price"),
  marketCap: text("market_cap"),
  volume: text("volume"),
  peRatio: text("pe_ratio"),
  change: text("change"),
  changePercent: text("change_percent"),
  companyName: text("company_name"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const historicalData = pgTable("historical_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  date: text("date").notNull(),
  open: text("open"),
  high: text("high"),
  low: text("low"),
  close: text("close"),
  volume: text("volume"),
  changePercent: text("change_percent"),
});

export const insertStockDataSchema = createInsertSchema(stockData).omit({
  id: true,
  lastUpdated: true,
});

export const insertHistoricalDataSchema = createInsertSchema(historicalData).omit({
  id: true,
});

export type StockData = typeof stockData.$inferSelect;
export type InsertStockData = z.infer<typeof insertStockDataSchema>;
export type HistoricalData = typeof historicalData.$inferSelect;
export type InsertHistoricalData = z.infer<typeof insertHistoricalDataSchema>;

export const stockSymbolSchema = z.object({
  symbol: z.string().min(1, "Stock symbol is required").max(10, "Symbol too long"),
});

export type StockSymbolRequest = z.infer<typeof stockSymbolSchema>;
