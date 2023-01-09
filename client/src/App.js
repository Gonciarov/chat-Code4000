import "./App.css";
import io from "socket.io-client";
import { useState, useEffect } from "react";
const socket = io.connect("http://localhost:3001");
import x from './x-icon.png';
import plane from './plane.png';

function App() {

    const [username, setUsername] = useState("");
    const [nameSubmitted, setNameSubmitted] = useState(false)
    const [room, setRoom] = useState("");
    const [msg, setMsg] = useState("");
    const [onlineUsersList, setOnlineUsersList] = useState([]);
    const [messages, setMessages] = useState([]);
    const [token, setToken] = useState("");
    const [anotherName, setAnotherName] = useState("");

    // Register a username to server db:
    const login = () => {
        for (let i = 0; i<onlineUsersList.length; i++) {
            //exclude duplicating usernames
            if (onlineUsersList[i].nickname == username) {
                displayErrorMessage('This username is already in use')
                return
            } 
        }
        if (username !== "") {
            setNameSubmitted(true);
            socket.emit("login", username);
            socket.emit('msg','request');
        } else {
            displayErrorMessage('Set your username.')
        }
    };
 
   const sendMsg = async() => {
        console.log(token)
        if (room !== "") {
            const message = {
                msg: msg,
                room: room,
                username: username,
                anotherName: anotherName,
                token: token
            };
            await socket.emit("send_message", message)
            let row = {};
            row[username] = msg;
           
            setMessages((messages) => [...messages, row]);
            setMsg("");
          
        } else {
            console.log("Username or ID is missing")
        }
        

    };

    // Display msg:
    useEffect(() => {
        socket.on('receive_message', (data) => {
            console.log(data.token)
            let row = {};
            row[data.username] = data.msg;
            setMessages((messages) => [...messages, row]);
           
    }, [socket]);



}, [])

function openDialog(id, name) {
    let string = [name, username].sort().join("-");
    setAnotherName(name);
    setToken(string);
    setRoom(id);
}



function closeDialog() {
    setRoom("");
    setMessages([]);

}

function displayErrorMessage(message) {
    document.getElementById("error-message").innerText = message;
}

// display online users
    useEffect(() => {
        getOnlineUsersList();   
    }, [username]);

 setInterval(checkOnline(anotherName), 500)

 function checkOnline(anotherName) {
    socket.on('online', (data) => {
        console.log(data)
    let filteredList = JSON.parse(data).filter(name => name.nickname === anotherName)
    if (typeof JSON.parse(data)[anotherName] === "undefined") {
        // console.log(filteredList)
       document.getElementById("history").innerHTML = '<h1>User has left the conversation</h1>'
    }
    })
 }

function getOnlineUsersList() {
    socket.on('online', (data) => {
        let filteredList = JSON.parse(data).filter(name => name.nickname !== username)
        setOnlineUsersList(filteredList)
    })
}
    
    return ( 
        <div>
        {nameSubmitted ? 
    <div className = "main">
 
        {room ? 
        <div>
       
            <div className="back">
            <img className="x" src={x} onClick = { closeDialog }/> 
            </div>
            <div id="history">
                {messages.map((row, index) => 
                     <p key={index}>{`${Object.keys(row)}: ${Object.values(row)}`}</p>
                )}
    
               
            </div>
          
            <div id="typing-area">
        <textarea value = {msg} onChange = {(event) => {setMsg(event.target.value);}}></textarea>
        <div>
        <img className="plane" src={plane} onClick = { sendMsg }/> 
        </div>
        </div>

        </div>
        :
        <div id="users-list">
        <p>You are in game under name <b>{username}</b></p>
      <p>Users online: </p>
      {onlineUsersList.map((user, index) => 
        <div key={index}>
            <button
                onClick={(event) => openDialog(user.id, user.nickname)}
                className="user-button"
                >
                {user.nickname}
            </button>
        </div>
        )}
    </div>
}
</div>
:
<div className="main">
    <br/>
    <input type = "text" placeholder = "Your Name" onChange = {(event) => {setUsername(event.target.value);}}/>
    <button onClick = { login }> Set Your Username </button>
    <p id="error-message"></p>
</div>
}
</div>

       )
    }

    export default App