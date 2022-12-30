import "./App.css";
import io from "socket.io-client";
import { useState, useEffect } from "react";
const socket = io.connect("http://localhost:3001")

function App() {

    const [username, setUsername] = useState("");
    const [room, setRoom] = useState("");
    const [msg, setMsg] = useState("");
    const [userList, setUserList] = useState([]);

    // Register an username to server db:
    const login = () => {
        if (username !== "") {
            socket.emit("login", username);
            socket.emit('msg','request')
        } else {
            console.log('Set your username.')
        }
    };
 
    // Display Online:
    socket.on('online',(data)=>{
      console.log(data)
    });

    // Send a message:
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

        })
    }, [socket]);
    
    return ( 
    <div className = "App" >

        <input type = "text" placeholder = "Your Name" onChange = {(event) => {setUsername(event.target.value);}}/>

        <button onClick = { login }> Set Your Username </button>

        <div>
          <p>Users online: </p>
        </div>

        <input type = "text" placeholder = "Client/Group name" onChange = {(event) => {setRoom(event.target.value);}}/>


        <input type = "text" placeholder = "Message" onChange = {(event) => {setMsg(event.target.value);}}/>

        <button onClick = { sendMsg } > Send Msg </button>

        </div>)
    }

    export default App