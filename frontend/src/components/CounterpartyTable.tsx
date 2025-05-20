import React from 'react';
import { useTheme } from '../context/themeContext';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';

interface Counterparty {
  address: string;
  label?: string;
  type: 'contract' | 'wallet';
  tx_count: number;
}

interface CounterpartyTableProps {
  items: Counterparty[];
}

const CounterpartyTable: React.FC<CounterpartyTableProps> = ({ items }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sortKey, setSortKey] = React.useState<keyof Counterparty | null>('tx_count');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const handleSort = (key: keyof Counterparty) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortArrow = (key: keyof Counterparty) => {
    if (sortKey !== key) return '';
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.address.toLowerCase().includes(query) ||
      (item.label || '').toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const aStr = String(aVal || '').toLowerCase();
    const bStr = String(bVal || '').toLowerCase();
    return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="overflow-x-auto rounded-xl shadow-lg">
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search address, label, or type..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border rounded-md text-sm w-full sm:w-64"
        />
      </div>
      <table
        className={twMerge(
          'min-w-full text-sm text-left table-auto',
          'border-collapse',
          isDark
            ? 'bg-gray-900 text-gray-100 border-gray-800'
            : 'bg-white text-gray-800 border-gray-200',
          'rounded-xl overflow-hidden'
        )}
      >
        <thead
          className={twMerge(
            'sticky top-0 z-10',
            isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
          )}
        >
          <tr>
            <th className="px-4 py-4 text-center border-b">S. No.</th>
            <th onClick={() => handleSort('address')} className="px-6 py-4 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none border-b">
              Address{sortArrow('address')}
            </th>
            <th onClick={() => handleSort('label')} className="px-6 py-4 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none border-b">
              Label{sortArrow('label')}
            </th>
            <th onClick={() => handleSort('type')} className="px-6 py-4 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none border-b">
              Type{sortArrow('type')}
            </th>
            <th onClick={() => handleSort('tx_count')} className="px-6 py-4 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none border-b">
              Transactions{sortArrow('tx_count')}
            </th>
            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider border-b">
              Explorer
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((item, index) => (
            <tr
              key={item.address}
              className={twMerge(
                index % 2 === 0 ? (isDark ? 'bg-gray-800/50' : 'bg-white/50') : (isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'),
                'hover:bg-blue-50/10 dark:hover:bg-gray-700/50 transition-colors duration-200'
              )}
            >
              <td className="px-4 py-4 text-center border-b">{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td className="px-6 py-4 border-b">
                <Link
                  to={`/wallet-analysis/${item.address}`}
                  className="text-blue-500 hover:underline hover:text-blue-400 transition-colors"
                >
                  {item.address.slice(0, 6)}...{item.address.slice(-4)}
                </Link>
              </td>
              <td className="px-6 py-4 border-b">
                {item.label || <span className="italic text-gray-400">Unknown</span>}
              </td>
              <td className="px-6 py-4 border-b">
                <span
                  className={twMerge(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    item.type === 'contract'
                      ? isDark
                        ? 'bg-purple-800/80 text-purple-200'
                        : 'bg-purple-100 text-purple-800'
                      : isDark
                      ? 'bg-blue-800/80 text-blue-200'
                      : 'bg-blue-100 text-blue-800'
                  )}
                >
                  {item.type}
                </span>
              </td>
              <td className="px-6 py-4 border-b">{item.tx_count}</td>
              <td className="px-6 py-4 border-b">
                <a
                  href={`https://basescan.org/address/${item.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline hover:text-blue-400 transition-colors"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounterpartyTable;