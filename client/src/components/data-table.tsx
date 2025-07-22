import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCSV } from "@/lib/csv-utils";
import type { HistoricalData } from "@shared/schema";

interface DataTableProps {
  symbol: string;
}

type SortField = "date" | "open" | "high" | "low" | "close" | "volume" | "changePercent";
type SortOrder = "asc" | "desc";

export default function DataTable({ symbol }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { data: historicalData, isLoading } = useQuery<HistoricalData[]>({
    queryKey: ["/api/stock", symbol, "historical"],
    enabled: !!symbol,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortedData = () => {
    if (!historicalData) return [];
    
    return [...historicalData].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === "volume") {
        // Handle volume strings like "45.2M"
        aValue = parseVolume(aValue as string);
        bValue = parseVolume(bValue as string);
      } else {
        aValue = parseFloat(aValue as string) || 0;
        bValue = parseFloat(bValue as string) || 0;
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const parseVolume = (volume: string): number => {
    if (!volume) return 0;
    const num = parseFloat(volume);
    if (volume.includes("M")) return num * 1000000;
    if (volume.includes("B")) return num * 1000000000;
    if (volume.includes("K")) return num * 1000;
    return num;
  };

  const handleExportCSV = () => {
    if (!historicalData) return;
    
    const csvData = historicalData.map(item => ({
      Date: item.date,
      Open: item.open,
      High: item.high,
      Low: item.low,
      Close: item.close,
      Volume: item.volume,
      "Change %": item.changePercent,
    }));
    
    downloadCSV(csvData, `${symbol}_historical_data.csv`);
  };

  const sortedData = getSortedData();

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 text-text-secondary hover:text-text-primary hover:bg-dark-primary"
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </Button>
  );

  if (isLoading) {
    return (
      <Card className="bg-dark-secondary border-dark-surface shadow-xl overflow-hidden">
        <CardContent className="p-6 border-b border-dark-surface">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <Skeleton className="h-6 w-32 mb-4 sm:mb-0 bg-dark-surface" />
            <Skeleton className="h-10 w-32 bg-dark-surface" />
          </div>
        </CardContent>
        <div className="p-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2 bg-dark-surface" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-secondary border-dark-surface shadow-xl overflow-hidden">
      <CardContent className="p-6 border-b border-dark-surface">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-lg font-semibold text-text-primary mb-4 sm:mb-0">
            Historical Data - {symbol}
          </h2>
          <Button
            onClick={handleExportCSV}
            className="bg-accent-green hover:bg-green-600 text-white flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </CardContent>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-dark-surface border-dark-surface hover:bg-dark-surface">
              <TableHead className="text-text-secondary font-medium">
                <SortButton field="date">Date</SortButton>
              </TableHead>
              <TableHead className="text-text-secondary font-medium">
                <SortButton field="open">Open</SortButton>
              </TableHead>
              <TableHead className="text-text-secondary font-medium">
                <SortButton field="high">High</SortButton>
              </TableHead>
              <TableHead className="text-text-secondary font-medium">
                <SortButton field="low">Low</SortButton>
              </TableHead>
              <TableHead className="text-text-secondary font-medium">
                <SortButton field="close">Close</SortButton>
              </TableHead>
              <TableHead className="text-text-secondary font-medium">
                <SortButton field="volume">Volume</SortButton>
              </TableHead>
              <TableHead className="text-text-secondary font-medium">
                <SortButton field="changePercent">Change %</SortButton>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => {
              const changePercent = parseFloat(item.changePercent || "0");
              const isPositive = changePercent >= 0;
              
              return (
                <TableRow
                  key={index}
                  className="border-dark-surface hover:bg-dark-surface transition-colors duration-200"
                >
                  <TableCell className="font-mono text-text-primary">
                    {new Date(item.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-mono text-text-primary">
                    ${parseFloat(item.open || "0").toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono text-text-primary">
                    ${parseFloat(item.high || "0").toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono text-text-primary">
                    ${parseFloat(item.low || "0").toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono text-text-primary">
                    ${parseFloat(item.close || "0").toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono text-text-secondary">
                    {item.volume}
                  </TableCell>
                  <TableCell className="font-mono">
                    <span className={`flex items-center ${
                      isPositive ? "text-accent-green" : "text-accent-red"
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {sortedData.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-text-secondary">No historical data available for {symbol}</p>
        </div>
      )}
    </Card>
  );
}
