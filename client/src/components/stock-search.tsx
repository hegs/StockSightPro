import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface StockSearchProps {
  onSymbolSelected: (symbol: string) => void;
}

export default function StockSearch({ onSymbolSelected }: StockSearchProps) {
  const [symbol, setSymbol] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!symbol.trim()) {
      setError("Please enter a stock symbol");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/stock/${symbol.toUpperCase()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch stock data");
      }

      const data = await response.json();
      onSymbolSelected(symbol.toUpperCase());
      toast({
        title: "Success",
        description: `Loaded data for ${data.companyName || symbol.toUpperCase()}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch stock data";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-dark-secondary rounded-lg p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Stock Analysis</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="stock-symbol" className="block text-sm font-medium text-text-secondary mb-2">
              Stock Symbol
            </label>
            <Input
              id="stock-symbol"
              type="text"
              placeholder="Enter symbol (e.g., AAPL, GOOGL, TSLA)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="bg-dark-surface border-dark-surface text-text-primary placeholder:text-text-secondary focus:ring-accent-green focus:border-accent-green"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-accent-green hover:bg-green-600 text-white font-medium flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>{isLoading ? "Analyzing..." : "Analyze"}</span>
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert className="mt-3 border-accent-red bg-red-950/20">
            <AlertDescription className="text-accent-red">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
