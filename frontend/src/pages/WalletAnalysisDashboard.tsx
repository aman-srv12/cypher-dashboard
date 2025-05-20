// pages/WalletAnalysisDashboard.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CounterpartyTable from '../components/CounterpartyTable';

type Counterparty = {
  address: string;
  tx_count: number;
  type: 'contract' | 'wallet';
  label: string;
  last_interaction?: string;
  last_tx_hash?: string;
};

export default function WalletAnalysisDashboard() {
  const { address } = useParams<{ address?: string }>();

  const [walletAddress, setWalletAddress] = useState(address || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [theme, setTheme] = useState('light');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const analyzeWallet = async (inputAddress?: string) => {
    const targetAddress = inputAddress || walletAddress;
    if (!targetAddress) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("https://cypher-backend-dz17.onrender.com/wallet-analysis", {
        params: { address: targetAddress },
        timeout: 100000,
      });

      setCounterparties(response.data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to analyze wallet:', err);
      setError('Failed to analyze wallet. Please try again.');
      setCounterparties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      analyzeWallet(address);
    }
  }, [address]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = counterparties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(counterparties.length / itemsPerPage);

  return (
    <div className={`min-h-screen p-4 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50'}`}>
      <div className={`max-w-7xl mx-auto my-4 rounded-lg shadow-md p-6 overflow-auto min-h-[85vh] ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h1 className={`text-2xl font-bold text-center mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
          🔍 Wallet Analysis Dashboard
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            className={`flex-1 border rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          />
          <button
            onClick={() => analyzeWallet()}
            disabled={loading || !walletAddress}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {error && (
          <div className={`mb-3 p-3 rounded-lg ${
            theme === 'dark' 
              ? 'bg-red-900/50 border-red-700 text-red-200' 
              : 'bg-red-100 border-red-200 text-red-600'
          }`}>
            {error}
          </div>
        )}

        {counterparties.length > 0 && (
          <div className={`rounded-md shadow-sm p-4 overflow-x-auto ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-white'
          }`}>
            <div className="min-w-full mb-2 pb-4">
              <CounterpartyTable items={currentItems} />
            </div>

            {/* Compact pagination controls */}
            <div className="flex justify-between items-center flex-wrap gap-2 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <label htmlFor="rowsPerPage" className="text-sm">Rows per page:</label>
                <select
                  id="rowsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {[5, 10, 20, 50].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm rounded border disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}