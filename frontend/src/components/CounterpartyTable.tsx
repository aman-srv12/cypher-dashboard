import React from 'react';
import { useTheme } from '../context/themeContext';
import { twMerge } from 'tailwind-merge'; // Correct import for tailwind-merge

//  *Important*:  Make sure this Counterparty interface matches the one
//  defined in your WalletAnalysisDashboard.tsx file.  The key is that the
//  'type' property must be consistent.  If your WalletAnalysisDashboard.tsx
//  uses  'contract' | 'wallet',  then this must also use that.
interface Counterparty {
  address: string;
  label?: string;
  type: 'contract' | 'wallet'; //  <--- Adjusted to match the error message
  tx_count: number;
}

interface CounterpartyTableProps {
  items: Counterparty[];
}

const CounterpartyTable: React.FC<CounterpartyTableProps> = ({ items }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="overflow-x-auto rounded-xl shadow-lg">
      <table
        className={twMerge(
          "min-w-full text-sm text-left table-auto",
          "border-collapse",
          isDark
            ? "bg-gray-900 text-gray-100 border-gray-800"
            : "bg-white text-gray-800 border-gray-200",
          "rounded-xl overflow-hidden",
        )}
      >
        <thead
          className={twMerge(
            "sticky top-0 z-10",
            isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700",
          )}
        >
          <tr>
            <th
              className={twMerge(
                "px-6 py-4 font-semibold text-xs uppercase tracking-wider",
                "border-b",
                isDark ? "border-gray-700" : "border-gray-300",
                "bg-opacity-90",
                "backdrop-blur-md"
              )}
            >
              Address
            </th>
            <th
              className={twMerge(
                "px-6 py-4 font-semibold text-xs uppercase tracking-wider",
                "border-b",
                isDark ? "border-gray-700" : "border-gray-300",
                "bg-opacity-90",
                "backdrop-blur-md"
              )}
            >
              Label
            </th>
            <th
              className={twMerge(
                "px-6 py-4 font-semibold text-xs uppercase tracking-wider",
                "border-b",
                isDark ? "border-gray-700" : "border-gray-300",
                "bg-opacity-90",
                "backdrop-blur-md"
              )}
            >
              Type
            </th>
            <th
              className={twMerge(
                "px-6 py-4 font-semibold text-xs uppercase tracking-wider",
                "border-b",
                isDark ? "border-gray-700" : "border-gray-300",
                "bg-opacity-90",
                "backdrop-blur-md"
              )}
            >
              Transactions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.address}
              className={twMerge(
                index % 2 === 0 ? (isDark ? "bg-gray-800/50" : "bg-white/50") : (isDark ? "bg-gray-900/50" : "bg-gray-50/50"),
                "hover:bg-blue-50/10 dark:hover:bg-gray-700/50 transition-colors duration-200",
              )}
            >
              <td
                className={twMerge(
                  "px-6 py-4 whitespace-nowrap",
                  "border-b",
                  isDark ? "border-gray-700" : "border-gray-300",
                )}
              >
                <a
                  href={`https://basescan.org/address/${item.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline hover:text-blue-400 transition-colors"
                >
                  {item.address.slice(0, 6)}...{item.address.slice(-4)}
                </a>
              </td>
              <td
                className={twMerge(
                  "px-6 py-4",
                  "border-b",
                  isDark ? "border-gray-700" : "border-gray-300",
                )}
              >
                {item.label || <span className="italic text-gray-400">Unknown</span>}
              </td>
              <td
                className={twMerge(
                  "px-6 py-4",
                  "border-b",
                  isDark ? "border-gray-700" : "border-gray-300",
                )}
              >
                <span
                  className={twMerge(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    item.type === "contract"
                      ? (isDark ? "bg-purple-800/80 text-purple-200" : "bg-purple-100 text-purple-800")
                      : (isDark ? "bg-blue-800/80 text-blue-200" : "bg-blue-100 text-blue-800"),
                  )}
                >
                  {item.type}
                </span>
              </td>
              <td
                className={twMerge(
                  "px-6 py-4",
                  "border-b",
                  isDark ? "border-gray-700" : "border-gray-300",
                )}
              >
                {item.tx_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CounterpartyTable;
