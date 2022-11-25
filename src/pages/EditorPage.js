import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  useLocation,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import "./EditorPage.css";

const EditorPage = () => {
  const socketRef = useRef(null); //useRef - on change it will not re-render the components again
  const location = useLocation();
  const codeRef = useRef(null);
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);

  const copyID = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Unique Key has been copied to clipboard");
    } catch (error) {
      toast.error("Could not copy the uniqueKey");
    }
  };
  
  const leaveRoom = () => {
    reactNavigator("/");
    function disableBack() {
      window.history.forward();
    }
    disableBack();
    window.onunload = function () {
      // eslint-disable-next-line no-unused-expressions
      null;
    };
  };
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      console.log(socketRef.current);
      socketRef.current.on("connection_error", (err) => handleErrors(err));
      socketRef.current.on("connection_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection has been failed");
        reactNavigator("/");
      }

      console.log(roomId);
      //joining of the new client
      socketRef.current.emit("join", {
        roomId,
        username: location.state?.username,
      });

      //joined event listening
      socketRef.current.on("joined", ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          //not including current client
          toast.success(`${username} is with you`);
        }
        setClients(clients);
        socketRef.current.emit("sync-code", {
          code: codeRef.current,
          socketId,
        });
      });

      socketRef.current.on("disconnected", ({ socketId, username }) => {
        toast.success(`${username} is no more with you`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();
    return () => {
      socketRef.current.off("joined");
      socketRef.current.off("disconnected");
      socketRef.current.disconnect();
    };
  }, []);

  if (!location.state) return <Navigate to="/" />;

  return (
    <div className="editorPageMain">
      <div className="left">
        <div className="leftInner">
          <div className="logo">
            <img src="/logo.png" alt="Logo" />
          </div>
          <h3>Connected Comrades</h3>
          <div className="connectedList">
            {clients.map((eachClient) => (
              <Client key={eachClient.id} username={eachClient.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyID}>
          Copy Unique ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="right">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => (codeRef.current = code)}
        />
      </div>
    </div>
  );
};

export default EditorPage;
