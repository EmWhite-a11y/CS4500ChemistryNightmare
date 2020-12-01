const bodyParser = require("body-parser");
const compression = require("compression");
const express = require("express");
const path = require("path");
const uuid = require("uuid");

// Set up server
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);

// Set up application
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Returns the home page
app.get("/", function(req, res) {
    res.render("home", {
        title: "Home"
    });
});

// Utility variable used to know if a player is waiting for a partner
var previousRoom = null;

// Redirects a user to a game
app.get("/play", function(req, res) {
    let room = previousRoom;
    
    if (room == null) {
        // Generate a new room and set the temporary room
        room = uuid.v4();
        previousRoom = room;
    } else {
        // Reset the temporary room
        previousRoom = null;
    }

    // Redirect the user to the room
    res.redirect(`/game/${room}`);
});

// Returns the game page
app.get("/game/:id", function(req, res) {
    res.render("game", {
        title: "Game",
        id: req.params.id
    });
});

// Returns the rules page
app.get("/rules", function(req, res) {
    res.render("rules", {
        title: "How to Play",
    });
});

// Start the server
server.listen(app.get("port"), function() {
    console.log("App is running at http://localhost:%d in %s mode", app.get("port"), app.get("env"));
});

// Set up socket connections
io.on("connection", function(socket) {
    console.log("User %s connected", socket.id);
    
    socket.on("disconnect", function() {
        console.log("User %s disconnected", socket.id);
    });
});