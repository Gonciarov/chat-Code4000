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
 
    function sendMsg() {
        if (room !== "") {
            const message = {
                msg: msg,
                room: room
            };
            socket.emit("send_message", message)
          
        } else {
            console.log("Username or ID is missing")
        }

    };

    // Display msg:
    useEffect(() => {
        socket.on('receive_message', (data) => {

            console.log(data)
       
   
    }, [socket]);

})

function openDialog(id) {
    setRoom(id)
}

function closeDialog() {
    setRoom("")

}

function displayErrorMessage(message) {
    document.getElementById("error-message").innerText = message;
}

// display online users
    useEffect(() => {
        socket.on('online', (data) => {
            let filteredList = JSON.parse(data).filter(name => name.nickname !== username)
            setOnlineUsersList(filteredList)
        })
       
           
    }, [username]);


    
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
                <p>message</p>
          
                <p>message</p>
               
                <p>message</p>
             
                <p>message</p>
             
                <p>message</p>
                <p>message</p>
    
               
            </div>
          
            <div id="typing-area">
        <textarea placeholder = "Message" onChange = {(event) => {setMsg(event.target.value);}}></textarea>
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
                name={user.id}
                onClick={(event) => openDialog(user.id)}
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