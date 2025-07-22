import { pgTable, text, serial, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stockData = pgTable("stock_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  marketCap: text("market_cap"),
  volume: text("volume"),
  peRatio: decimal("pe_ratio", { precision: 10, scale: 2 }),
  change: decimal("change", { precision: 10, scale: 2 }),
  changePercent: decimal("change_percent", { precision: 10, scale: 2 }),
  companyName: text("company_name"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const historicalData = pgTable("historical_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  date: text("date").notNull(),
  open: decimal("open", { precision: 10, scale: 2 }),
  high: decimal("high", { precision: 10, scale: 2 }),
  low: decimal("low", { precision: 10, scale: 2 }),
  close: decimal("close", { precision: 10, scale: 2 }),
  volume: text("volume"),
  changePercent: decimal("change_percent", { precision: 10, scale: 2 }),
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
