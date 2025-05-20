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

  const analyzeWallet = async (inputAddress?: string) => {
    const targetAddress = inputAddress || walletAddress;
    if (!targetAddress) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:8000/wallet-analysis`, {
        params: { address: targetAddress },
        timeout: 100000,
      });

      setCounterparties(response.data);
    } catch (err) {
      console.error('Failed to analyze wallet:', err);
      setError('Failed to analyze wallet. Please try again.');
      setCounterparties([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger analysis if address is present in the URL
  useEffect(() => {
    if (address) {
      analyzeWallet(address);
    }
  }, [address]);

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50'}`}>
      <div className={`max-w-6xl mx-auto rounded-lg shadow-md p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className={`text-3xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
          🔍 Wallet Analysis Dashboard
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg ${
            theme === 'dark' 
              ? 'bg-red-900/50 border-red-700 text-red-200' 
              : 'bg-red-100 border-red-200 text-red-600'
          }`}>
            {error}
          </div>
        )}

        {counterparties.length > 0 && (
          <div className={`rounded-md shadow-sm p-4 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-white'
          }`}>
            <CounterpartyTable items={counterparties} />
          </div>
        )}
      </div>
    </div>
  );
}
