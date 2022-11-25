import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from 'react-hot-toast'
import { useNavigate } from "react-router-dom";
import './Home.css'

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("")

  const navigate = useNavigate();

  const handleInput = (e) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") joinGroup();
  }

  const joinGroup = () => {
    if(!roomId)
    {
      toast.error("Please enter the Unique Key");
      return;
    }
    if(!username)
    {
      toast.error("Please enter your username");
      return;
    }
    if(roomId.length !== 36)
    {
      toast.error("Invalid Unique Key")
      return;
    }
    navigate(`/codeEditor/${roomId}`,{
      state:{
        username //using state so that we can pass this info to navigated page[built in router-dom]
      }
    });
  }

  const createNewGroup = (e) => {
    const id = uuid();
    setRoomId(id);
    navigator.clipboard.writeText(id);
    toast.success("Created new group & uniqueID is copied to clipboard",{
      duration:4000,
      style:{
        maxWidth:"500px",
      }
    });
  };

  return (
    <div className="homePageMain">
      <div className="homeForm">
        <img src="/logo.png" alt="" />
        <h4 className="mainLabel">Get your Comrade</h4>
        <div className="inputs">
          <input
            type="text"
            className="eachInput"
            placeholder="UNIQUE KEY"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInput}
          />
          <input
            type="text"
            className="eachInput"
            placeholder="USERNAME"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleInput}
          />
          <button className="btn joinBtn" onClick={joinGroup}>
            Join your Comrades
          </button>
          <span className="createInfo">
            Create a new Comrade group &nbsp;
            <button onClick={createNewGroup} className="btn createBtn">
              New Group
            </button>
          </span>
        </div>
      </div>
      <footer>
        <h4>Built with 💛 by Lord Voldemort</h4>
      </footer>
    </div>
  );
};

export default Home;
