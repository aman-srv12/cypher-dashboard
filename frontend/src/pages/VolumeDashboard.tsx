import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import LoadChart from "../components/LoadChart";
import axios from "axios";

type ChartEntry = { date?: string; week?: string; month?: string; usd: number };

// Spinner
const Spinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Get yesterday’s date
const getYesterday = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
};

export default function VolumeDashboard() {
  const [dailyData, setDailyData] = useState<ChartEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<ChartEntry[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const getInitialFromDate = () => searchParams.get("from") || "2025-01-01";
  const getInitialToDate = () => searchParams.get("to") || getYesterday();

  const [fromDate, setFromDate] = useState(getInitialFromDate());
  const [toDate, setToDate] = useState(getInitialToDate());

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://cypher-backend-dz17.onrender.com/load-volume", {
        params: { from_date: fromDate, to_date: toDate },
        timeout: 100000,
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

  // Fetch on search param change
  useEffect(() => {
    const from = getInitialFromDate();
    const to = getInitialToDate();
    setFromDate(from);
    setToDate(to);
    fetchChartData();
  }, [searchParams]);

  const handleSubmit = () => {
    setSearchParams({ from: fromDate, to: toDate });
  };

  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50"}`}>
      <div className={`max-w-6xl mx-auto rounded-lg shadow-md p-8 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <h1 className={`text-3xl font-bold text-center mb-6 ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>
          📊 Cypher Load Dashboard
        </h1>

        {/* Filters */}
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
              max={getYesterday()}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </div>
        </div>

        {/* Charts */}
        {[
          { title: "Daily Volume", data: dailyData, key: "date" },
          { title: "Weekly Volume", data: weeklyData, key: "week" },
          { title: "Monthly Volume", data: monthlyData, key: "month" },
        ].map(({ title, data, key }) => (
          <div className="mb-8" key={key}>
            <h2 className={`text-xl font-semibold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>{title}</h2>
            {loading ? (
              <Spinner />
            ) : data.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No {title.toLowerCase()} available</p>
            ) : (
              <div className={`rounded-md shadow-sm p-4 ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
                <LoadChart data={data} dataKey={key} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}