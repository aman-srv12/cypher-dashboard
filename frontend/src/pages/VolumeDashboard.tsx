import { useEffect, useState } from "react";
import LoadChart from "../components/LoadChart";
import axios from "axios";

type ChartEntry = { date?: string; week?: string; month?: string; usd: number };

export default function VolumeDashboard() {
  const [dailyData, setDailyData] = useState<ChartEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<ChartEntry[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");
  const [theme, setTheme] = useState("light");

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/load-volume", {
        params: {
          from_date: fromDate,
          to_date: toDate,
        },
        timeout: 10000,
      });

      setDailyData(response.data.daily || []);
      setWeeklyData(response.data.weekly || []);
      setMonthlyData(response.data.monthly || []);
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [fromDate, toDate]);

  return (
      <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50'}`}>
        <div className={`max-w-6xl mx-auto rounded-lg shadow-md p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-3xl font-bold text-center ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
              📊 Cypher Load Dashboard
            </h1>
          </div>
  
          {/* Filter Component */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border rounded p-2 min-w-[150px]"
                max={toDate}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border rounded p-2 min-w-[150px]"
                min={fromDate}
              />
            </div>
          </div>
  
          {/* Daily Chart */}
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Daily Volume</h2>
            {loading ? (
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
            ) : (
              <div className={`rounded-md shadow-sm p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                <LoadChart data={dailyData} dataKey="date" />
              </div>
            )}
          </div>
  
          {/* Weekly Chart */}
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Weekly Volume</h2>
            {loading ? (
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
            ) : (
              <div className={`rounded-md shadow-sm p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                <LoadChart data={weeklyData} dataKey="week" />
              </div>
            )}
          </div>
  
          {/* Monthly Chart */}
          <div>
            <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Monthly Volume</h2>
            {loading ? (
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
            ) : (
              <div className={`rounded-md shadow-sm p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                <LoadChart data={monthlyData} dataKey="month" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
}