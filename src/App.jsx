import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
const socket = io(`localhost:8080`, {
  transports: ["websocket"],
  upgrade: false,
  autoConnect: false,
});
function App() {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connection, setConnection] = useState({
    port: "",
    host: "",
  });
  const [data, setData] = useState({
    Imei: "",
    DSCode: "",
    Id: "",
    token: "",
  });

  const connect = async (e) => {
    e.preventDefault();
    if (connected) {
      socket.emit("disconnectTcpServer");
      setConnected(false);
      return;
    }
    if (socket.active) socket.emit("connectTcp", connection);
    else alert("error");
    setConnected(true);
  };

  const submit = (e) => {
    e.preventDefault();
    socket.emit("data", data);
    // setData({
    //   Imei: "",
    //   DSCode: "",
    //   Id: "",
    //   token: "",
    // });
  };
  const onConnectionChange = (e) => {
    setConnection({ ...connection, [e.target.name]: e.target.value });
  };
  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  const saveLogs = (log) => setLogs((previousState) => [...previousState, log]);
  const onError = (log) => {
    setLogs((previousState) => [...previousState, log]);
    setConnected(false);
  };
  const onTCPDisconnect = (log) => {
    setLogs([...logs, log]);
    setConnected(false);
  };

  useEffect(() => {
    socket.connect();
    socket.on("tcpActive", saveLogs);
    socket.on("tcpDisconneted", onTCPDisconnect);
    socket.on("tcpData", saveLogs);
    socket.on("tcpError", onError);
    return () => {
      socket.close();
      socket.off("tcpActive", saveLogs);
      socket.off("tcpDisconneted", onTCPDisconnect);
      socket.off("tcpData", saveLogs);
      socket.off("tcpError", onError);
    };
  }, []);

  useEffect(() => {
    const canvas = document.getElementsByClassName("response")[0];
    // canvas.scrollTo = canvas.scrollHeight;
    canvas.scrollTo(0, canvas.scrollHeight);
  }, [logs]);

  return (
    <>
      <header className="header text-center">
        <h3 className="mt-4">
          TCP Server Connection : {connected ? "Connected" : "Not Connected"}
        </h3>
        {/* <h3 className="mt-4">
          Socekt Server Connection :{" "}
          {s?.connected ? "Connected" : "Not Connected"}
        </h3> */}
      </header>
      <div className="container">
        <form className="form" onSubmit={connect}>
          <h3>Connect to Server</h3>
          <input
            type="text"
            onChange={onConnectionChange}
            name="host"
            value={connection?.host}
            placeholder="Host"
            required={!connected}
            disabled={connected}
          />
          <input
            type="text"
            onChange={onConnectionChange}
            name="port"
            value={connection?.port}
            placeholder="Port"
            required={!connected}
            disabled={connected}
          />
          <button type="submit">
            {connected ? "Disconnect" : "Connect"} TCP Server
          </button>
        </form>
        <form className="form" onSubmit={submit}>
          <h3>Send Data to Server</h3>
          <input
            type="text"
            placeholder="Imei"
            onChange={onChange}
            name="Imei"
            value={data?.Imei}
          />
          <input
            type="text"
            placeholder="DSCode"
            onChange={onChange}
            name="DSCode"
            value={data?.DSCode}
          />
          <input
            type="text"
            placeholder="Id"
            onChange={onChange}
            name="Id"
            value={data?.Id}
          />
          <input
            type="text"
            placeholder="Token"
            onChange={onChange}
            name="Token"
            value={data?.token}
          />
          <span
            className="helper"
            style={{ display: !connected ? "block" : "hidden" }}
          >
            {" "}
            * Connect to server before sending data
          </span>
          <button disabled={!connected} type="submit">
            Send Data
          </button>
        </form>
        <div className="responses">
          <h3>Response from server</h3>
          <div className="response">
            {logs && logs.length
              ? logs.map((log, index) => <p key={index}>{log}</p>)
              : "NO LOGS"}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
