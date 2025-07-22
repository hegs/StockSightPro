import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { stockSymbolSchema } from "@shared/schema";
import { z } from "zod";

// Yahoo Finance API function
async function fetchYahooFinanceData(symbol: string) {
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
  
  try {
    const response = await fetch(yahooUrl);
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      throw new Error("Invalid stock symbol or no data available");
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    
    // Current stock data
    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
    const change = meta.regularMarketPrice ? (meta.regularMarketPrice - meta.previousClose) : 0;
    const changePercent = meta.previousClose ? (change / meta.previousClose) * 100 : 0;
    
    const stockData = {
      symbol: symbol.toUpperCase(),
      currentPrice: currentPrice.toString(),
      marketCap: formatMarketCap(meta.marketCap),
      volume: formatVolume(meta.regularMarketVolume),
      peRatio: meta.trailingPE?.toString() || "N/A",
      change: change.toString(),
      changePercent: changePercent.toString(),
      companyName: meta.longName || symbol.toUpperCase(),
    };
    
    // Historical data (last 30 days)
    const historicalData = timestamps.slice(-30).map((timestamp: number, index: number) => {
      const date = new Date(timestamp * 1000).toISOString().split('T')[0];
      const open = quotes.open?.[timestamps.length - 30 + index] || 0;
      const high = quotes.high?.[timestamps.length - 30 + index] || 0;
      const low = quotes.low?.[timestamps.length - 30 + index] || 0;
      const close = quotes.close?.[timestamps.length - 30 + index] || 0;
      const volume = quotes.volume?.[timestamps.length - 30 + index] || 0;
      
      const prevClose = index > 0 ? (quotes.close?.[timestamps.length - 30 + index - 1] || close) : close;
      const dayChange = prevClose ? ((close - prevClose) / prevClose) * 100 : 0;
      
      return {
        symbol: symbol.toUpperCase(),
        date,
        open: open.toString(),
        high: high.toString(),
        low: low.toString(),
        close: close.toString(),
        volume: formatVolume(volume),
        changePercent: dayChange.toString(),
      };
    }).filter(item => item.close !== "0");
    
    return { stockData, historicalData };
  } catch (error) {
    console.error("Yahoo Finance API Error:", error);
    throw new Error("Failed to fetch stock data. Please verify the symbol and try again.");
  }
}

function formatMarketCap(value: number): string {
  if (!value) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

function formatVolume(value: number): string {
  if (!value) return "0";
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get stock data
  app.get("/api/stock/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const validatedData = stockSymbolSchema.parse({ symbol });
      
      // Try to get from storage first
      let stockData = await storage.getStockData(validatedData.symbol);
      
      // If not in storage or data is old (> 5 minutes), fetch fresh data
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (!stockData || (stockData.lastUpdated && stockData.lastUpdated < fiveMinutesAgo)) {
        const { stockData: freshStockData, historicalData } = await fetchYahooFinanceData(validatedData.symbol);
        
        stockData = await storage.saveStockData(freshStockData);
        await storage.saveHistoricalData(historicalData);
      }
      
      res.json(stockData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stock symbol format" });
      }
      
      console.error("Stock data error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch stock data" 
      });
    }
  });
  
  // Get historical data
  app.get("/api/stock/:symbol/historical", async (req, res) => {
    try {
      const { symbol } = req.params;
      const validatedData = stockSymbolSchema.parse({ symbol });
      
      const historicalData = await storage.getHistoricalData(validatedData.symbol);
      
      // If no historical data, try to fetch it
      if (historicalData.length === 0) {
        try {
          const { stockData, historicalData: freshHistoricalData } = await fetchYahooFinanceData(validatedData.symbol);
          await storage.saveStockData(stockData);
          const savedHistorical = await storage.saveHistoricalData(freshHistoricalData);
          return res.json(savedHistorical);
        } catch (error) {
          return res.json([]); // Return empty array if fetch fails
        }
      }
      
      res.json(historicalData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stock symbol format" });
      }
      
      console.error("Historical data error:", error);
      res.status(500).json({ message: "Failed to fetch historical data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
