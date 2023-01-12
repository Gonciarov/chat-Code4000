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
    const [notifs, setNotifs] = useState({});

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
        if (room !== "") {
            const message = {
                msg: msg,
                room: room,
                username: username,
                anotherName: anotherName,
                token: token
            };
            await socket.emit("send_message", message);
            setMessages((messages) => [...messages, message]);
            setMsg("");
            console.log(messages);
          
        } else {
            console.log("Username or ID is missing")
        }
        

    };

    // Display msg:
    useEffect(() => {
        socket.on('receive_message', (data) => {
            console.log(data)
            addNotif(data.username);
            setMessages(messages => [...messages, data]);
           
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
    removeNotif(anotherName)
}

function addNotif(nickname) {
    let counter = notifs[nickname] || 0;
    let x = notifs;
    x[nickname] = counter + 1;
    setNotifs(x);
}

function removeNotif(name) {
    let x = notifs;
    delete x[name];
    setNotifs(x);
}

function displayErrorMessage(message) {
    document.getElementById("error-message").innerText = message;
}

// display online users
    useEffect(() => {
        getOnlineUsersList();   
    }, [username]);

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
                {messages.map((message, index) => 
                    message.token === token ?
                     <p key={index}>{`${message.username}: ${message.msg}`}</p>
                     : null
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
            </button>{notifs[user.nickname]}
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