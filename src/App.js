import React, { useEffect, useState } from "react";

export default function App() {
  const [refreshActive, setRefreshActive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [steamid, setSteamId] = useState("76561198027916204");
  const [token, setToken] = useState("");
  const [timeout, setTimeoutValue] = useState(10);
  const [count, setCount] = useState(100);
  const [logs, setLogs] = useState([]);
  const [sentRequests, setSentRequests] = useState(0);
  const [nextUpdateTime, setNextUpdateTime] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      if (nextUpdateTime !== 0) {
        if (nextUpdateTime - 0.01 < 0) {
          setNextUpdateTime(0);
        } else {
          setNextUpdateTime(nextUpdateTime - 0.01);
        }
      }
    }, 10)
  }, [nextUpdateTime]);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const SendRefreshRequest = async () => {
    setRefreshActive(false);
    setSentRequests(0);

    let logsCopy = [...logs];
    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch(
          `https://backpack.tf/api/inventory/${steamid}/refresh?token=${token}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          logsCopy.push({
            text: `Refresh successful, next update in ${data.next_update - data.current_time}s`,
            color: "bg-green-700",
          });
        } else {
          logsCopy.push({
            text: `Request failed: ${response.status}, ${data.message}`,
            color: "bg-red-700",
          });
        }

        setNextUpdateTime(timeout);
        setSentRequests(i + 1);
      } catch (error) {
        logsCopy.push({ text: `Error: ${error.message}`, color: "bg-red-700" });
      }
      setLogs([...logsCopy]);
      await sleep(timeout * 1000);
    }
    setRefreshActive(true);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col lg:flex-row items-start p-4 gap-6">
      {/* Input Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Spammer</h1>
        <label className="block mb-1">SteamID</label>
        <input
          type="text"
          value={steamid}
          onChange={(e) => setSteamId(e.target.value)}
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />
        <label className="block mb-1">Token</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />
        <label className="block mb-1">Timeout (s)</label>
        <input
          type="number"
          value={timeout}
          onChange={(e) => setTimeoutValue(Number(e.target.value))}
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />
        <label className="block mb-1">Count</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full p-2 mb-4 bg-gray-700 rounded"
        />
        <button
          onClick={SendRefreshRequest}
          disabled={!refreshActive}
          className={`w-full p-2 rounded ${refreshActive ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-600"}`}
        >
          Refresh
        </button>
        <button
          onClick={() => setIsRunning(false)}
          className="w-full mt-2 p-2 bg-red-500 hover:bg-red-600 rounded"
        >
          Stop
        </button>
      </div>
      {/* Logs Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md lg:max-w-xl">
        <h2 className="text-xl font-bold mb-4 flex justify-between">
          <span>Logs</span>
          <span className="text-sm text-gray-400 font-mono w-[400px] inline-block text-right">
            Sent: {sentRequests.toString().padStart(3, ' ')} / {count.toString().padStart(3, ' ')} |
            Next: {nextUpdateTime ? nextUpdateTime.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).padStart(6, ' ') + 's' : "   -  "}
          </span>

        </h2>
        <div className="h-60 overflow-y-auto space-y-2">
          {logs.map((log, index) => (
            <div key={index} className={`p-3 rounded shadow ${log.color}`}>
              <p>{log.text}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setLogs([])}
          className="w-full mt-2 p-2 bg-red-500 hover:bg-red-600 rounded"
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
}
