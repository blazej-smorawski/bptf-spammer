import React, { useEffect, useState, useCallback } from "react";

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

  const SendRequest = useCallback(async () => {
    let logsCopy = [...logs];
    try {
      const response = await fetch(
        `https://backpack.tf/api/inventory/${steamid}/refresh?token=${token}`,
        { method: "POST", headers: { Accept: "application/json" } }
      );
      const data = await response.json();
      logsCopy.push({
        text: response.ok
          ? `Refresh successful, next update in ${data.next_update - data.current_time}s`
          : `Request failed: ${response.status}, ${data.message}`,
        color: response.ok ? "bg-green-700" : "bg-red-700",
      });
    } catch (error) {
      logsCopy.push({ text: `Error: ${error.message}`, color: "bg-red-700" });
    }
    setLogs([...logsCopy]);
  }, [logs, steamid, token]);

  const SendRefreshRequest = async () => {
    setRefreshActive(false);
    setSentRequests(0);
    setIsRunning(true);
    
    await SendRequest();
    setSentRequests(1);
    setNextUpdateTime(timeout);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (nextUpdateTime !== 0) {
        if(nextUpdateTime - 0.01 < 0) {
          await SendRequest();
          setSentRequests(sentRequests + 1);
          if(sentRequests < count && isRunning) {
            setNextUpdateTime(timeout);
          } else {
            // Done with requests
            setRefreshActive(true);
          }
        } else {
          if(isRunning) {
            setNextUpdateTime(nextUpdateTime - 0.01);
          } else {
            setRefreshActive(true);
          }
        }
      }
    }, 10);
    
    return () => clearTimeout(timer); // Cleanup function to prevent memory leaks
  }, [nextUpdateTime, isRunning, count, timeout, sentRequests, SendRequest]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col lg:flex-row p-4 gap-4">
      {/* Input Section */}
      <div className="bg-gray-800 p-4 rounded-lg w-full max-w-sm self-start">
        <h1 className="text-xl font-bold mb-2">Spammer</h1>
        <input type="text" value={steamid} onChange={(e) => setSteamId(e.target.value)} className="w-full p-2 mb-2 bg-gray-700 rounded" placeholder="SteamID" />
        <input type="text" value={token} onChange={(e) => setToken(e.target.value)} className="w-full p-2 mb-2 bg-gray-700 rounded" placeholder="Token" />
        <input type="number" value={timeout} onChange={(e) => setTimeoutValue(Number(e.target.value))} className="w-full p-2 mb-2 bg-gray-700 rounded" placeholder="Timeout (s)" />
        <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full p-2 mb-4 bg-gray-700 rounded" placeholder="Count" />
        <button onClick={SendRefreshRequest} disabled={!refreshActive} className={`w-full p-2 rounded ${refreshActive ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-600"}`}>Refresh</button>
        <button onClick={() => setIsRunning(false)} className="w-full mt-2 p-2 bg-red-500 hover:bg-red-600 rounded">Stop</button>
      </div>

      {/* Logs Section - Expands Dynamically */}
      <div className="bg-gray-800 p-4 rounded-lg flex-1 self-start">
        <h2 className="text-lg font-bold mb-2 flex justify-between">
          <span>Logs</span>
          <span className="text-sm text-gray-400 font-mono">
            Sent: {sentRequests.toString().padStart(3, " ")} / {count.toString().padStart(3, " ")} | 
            Next: {nextUpdateTime ? nextUpdateTime.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).padStart(6, " ") + "s" : "   -  "}
          </span>
        </h2>
        <div className="overflow-y-auto space-y-2">
          {logs.map((log, index) => (
            <div key={index} className={`p-2 rounded ${log.color}`}>
              {log.text}
            </div>
          ))}
        </div>
        <button onClick={() => setLogs([])} className="w-full mt-2 p-2 bg-red-500 hover:bg-red-600 rounded">Clear Logs</button>
      </div>
    </div>
  );
}
