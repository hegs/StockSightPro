import { useQuery } from "@tanstack/react-query";
import { DollarSign, Building, BarChart, Percent, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StockData } from "@shared/schema";

interface StockOverviewProps {
  symbol: string;
}

export default function StockOverview({ symbol }: StockOverviewProps) {
  const { data: stockData, isLoading, error } = useQuery<StockData>({
    queryKey: ["/api/stock", symbol],
    enabled: !!symbol,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-dark-secondary border-dark-surface">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2 bg-dark-surface" />
              <Skeleton className="h-8 w-24 mb-2 bg-dark-surface" />
              <Skeleton className="h-4 w-16 bg-dark-surface" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stockData) {
    return null;
  }

  const change = parseFloat(stockData.change || "0");
  const changePercent = parseFloat(stockData.changePercent || "0");
  const isPositive = change >= 0;

  const metrics = [
    {
      title: "Current Price",
      value: `$${parseFloat(stockData.currentPrice || "0").toFixed(2)}`,
      icon: DollarSign,
      change: change,
      changePercent: changePercent,
      showChange: true,
    },
    {
      title: "Market Cap",
      value: stockData.marketCap || "N/A",
      icon: Building,
      subtitle: "Market Value",
      showChange: false,
    },
    {
      title: "Volume",
      value: stockData.volume || "N/A",
      icon: BarChart,
      subtitle: "24h Volume",
      showChange: false,
    },
    {
      title: "P/E Ratio",
      value: stockData.peRatio !== "N/A" ? parseFloat(stockData.peRatio || "0").toFixed(2) : "N/A",
      icon: Percent,
      subtitle: "Price to Earnings",
      showChange: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-dark-secondary border-dark-surface hover:shadow-2xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-text-secondary text-sm font-medium">{metric.title}</h3>
              <metric.icon className={`h-5 w-5 ${
                index === 0 ? "text-accent-green" : 
                index === 1 ? "text-blue-400" : 
                index === 2 ? "text-purple-400" : "text-yellow-400"
              }`} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold font-mono text-text-primary">{metric.value}</p>
                {metric.showChange && (
                  <p className={`text-sm flex items-center mt-1 ${
                    isPositive ? "text-accent-green" : "text-accent-red"
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
                  </p>
                )}
                {metric.subtitle && !metric.showChange && (
                  <p className="text-text-secondary text-sm mt-1">{metric.subtitle}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
