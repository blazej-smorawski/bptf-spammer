import React, { useState } from "react";

export default function App() {
  const [refreshActive, setRefreshActive] = useState(true);
  const [steamid, setSteamId] = useState("76561198027916204");
  const [token, setToken] = useState("");
  const [timeout, setTimeoutValue] = useState(10);
  const [count, setCount] = useState(100);
  const [logs, setLogs] = useState([]);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const SendRefreshRequest = async () => {
    setRefreshActive(false);
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
            color: "text-green-500",
          });
        } else {
          logsCopy.push({
            text: `Request failed: ${response.status}, ${data.message}`,
            color: "text-red-500",
          });
        }
      } catch (error) {
        logsCopy.push({ text: `Error: ${error.message}`, color: "text-red-500" });
      }
      setLogs([...logsCopy]);
      await sleep(timeout * 1000);
    }
    setRefreshActive(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Spammer</h1>
        <input
          type="text"
          placeholder="SteamID"
          value={steamid}
          onChange={(e) => setSteamId(e.target.value)}
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />
        <input
          type="text"
          placeholder="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />
        <input
          type="number"
          placeholder="Timeout (s)"
          value={timeout}
          onChange={(e) => setTimeoutValue(Number(e.target.value))}
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />
        <input
          type="number"
          placeholder="Count"
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
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mt-4">
        <h2 className="text-xl font-bold mb-4">Logs</h2>
        <div className="h-40 overflow-y-auto border border-gray-700 p-2 rounded">
          {logs.map((log, index) => (
            <p key={index} className={log.color}>{log.text}</p>
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
