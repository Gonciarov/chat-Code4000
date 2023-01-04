const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
app.use(cors({
    origin: `http://localhost:3000`
}));
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

let db = new Array(); // Contain full details from each user(nickname/id).
let users = new Set(); // Contain all online users name(only nickanme).

app.post("/online", (req, res) => {
    res.send(JSON.stringify(Array.from(db)))
})

io.on('connection', (socket) => {

    // Send a message to UI:
    socket.on('send_message', (data) => {
        console.log(data)
        socket.to(data.room).emit('receive_message', data.msg);
    });


    // Register and Update new connected client:' save in "db" and "users" '.
    socket.on('login', (data) => {
        const user = {};
        user.nickname = data;
        user.id = socket.id;

        if (db.length === 0) {
            db.push(user);
            users.add(data);
        } else if (db.length > 0) {
            for (nickname of db) {
                users.add(nickname.nickname);
                if (nickname.nickname === data) {
                    nickname = socket.id
                }
            };

            let allUsers = Array.from(users);
            let value = allUsers.find(val => {
                return val === data
            });
            if (!value) {
                db.push(user);
                users.add(data);
            };
        };
        console.log({ db, users });
        display();

    });

    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
      });


    // Send online users to UI:
    function display() {
        socket.leave(socket.id);
        socket.broadcast.emit('online', JSON.stringify(Array.from(db)));
        socket.join(socket.id);
    };

    // Remove from db any disconnected user:
    socket.on('disconnect', () => {
        for (i = 0; i < db.length; i++) {
            if (db[i].id === socket.id) {
                users.delete(db[i].nickname);
                db.splice(i, 1);
            };
        };
        console.log({ db, users });
        display();
    });
});


io.listen(3001, () => {
    console.log("Server is online");
});