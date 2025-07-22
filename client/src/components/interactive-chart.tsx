import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { HistoricalData, StockData } from "@shared/schema";

interface InteractiveChartProps {
  symbol: string;
}

type TimeFrame = "1D" | "5D" | "1M" | "3M" | "1Y";

export default function InteractiveChart({ symbol }: InteractiveChartProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>("5D");

  const { data: stockData } = useQuery<StockData>({
    queryKey: ["/api/stock", symbol],
    enabled: !!symbol,
  });

  const { data: historicalData, isLoading } = useQuery<HistoricalData[]>({
    queryKey: ["/api/stock", symbol, "historical"],
    enabled: !!symbol,
  });

  const timeframes: TimeFrame[] = ["1D", "5D", "1M", "3M", "1Y"];

  const getFilteredData = () => {
    if (!historicalData) return [];
    
    const now = new Date();
    let daysBack = 5;
    
    switch (timeframe) {
      case "1D":
        daysBack = 1;
        break;
      case "5D":
        daysBack = 5;
        break;
      case "1M":
        daysBack = 30;
        break;
      case "3M":
        daysBack = 90;
        break;
      case "1Y":
        daysBack = 365;
        break;
    }
    
    return historicalData
      .slice(-daysBack)
      .map(item => ({
        date: item.date,
        price: parseFloat(item.close || "0"),
        formattedDate: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));
  };

  const chartData = getFilteredData();

  if (isLoading) {
    return (
      <Card className="bg-dark-secondary border-dark-surface shadow-xl mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <Skeleton className="h-6 w-40 mb-4 sm:mb-0 bg-dark-surface" />
            <div className="flex space-x-2">
              {timeframes.map((tf) => (
                <Skeleton key={tf} className="h-8 w-12 bg-dark-surface" />
              ))}
            </div>
          </div>
          <Skeleton className="h-80 w-full bg-dark-surface" />
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-secondary border border-dark-surface rounded-lg p-3 shadow-lg">
          <p className="text-text-secondary text-sm">{label}</p>
          <p className="text-text-primary font-mono">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-dark-secondary border-dark-surface shadow-xl mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 sm:mb-0">
            Price Chart - {stockData?.companyName || symbol}
          </h2>
          <div className="flex space-x-2">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                onClick={() => setTimeframe(tf)}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                className={`px-3 py-1 text-sm transition-colors duration-200 ${
                  timeframe === tf
                    ? "bg-accent-green text-white hover:bg-green-600"
                    : "bg-dark-surface hover:bg-accent-green hover:text-white border-dark-surface text-text-secondary"
                }`}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        <div className="relative h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-surface)" />
                <XAxis
                  dataKey="formattedDate"
                  stroke="var(--text-secondary)"
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--accent-green)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent-green)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "var(--accent-green)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">No chart data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
