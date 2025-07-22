import { useState } from "react";
import { ChartLine } from "lucide-react";
import StockSearch from "@/components/stock-search";
import StockOverview from "@/components/stock-overview";
import InteractiveChart from "@/components/interactive-chart";
import DataTable from "@/components/data-table";

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header */}
      <header className="bg-dark-secondary border-b border-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ChartLine className="text-accent-green h-8 w-8" />
              <h1 className="text-xl font-semibold text-text-primary">Financial Dashboard</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-text-secondary text-sm">Real-time market data</span>
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stock Search Section */}
        <StockSearch onSymbolSelected={setSelectedSymbol} />
        
        {selectedSymbol && (
          <>
            {/* Stock Overview Cards */}
            <StockOverview symbol={selectedSymbol} />
            
            {/* Chart Section */}
            <InteractiveChart symbol={selectedSymbol} />
            
            {/* Data Table Section */}
            <DataTable symbol={selectedSymbol} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-dark-secondary mt-12 border-t border-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-text-secondary text-sm">
            <p>Financial data provided by Yahoo Finance API. Not for investment advice.</p>
            <p className="mt-2">© 2024 Financial Dashboard. Built with React and Recharts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
