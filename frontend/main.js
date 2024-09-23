/**
 * This script has two functional parts:
 *  1. Frontend rendering (game hall)
 *  2. WebSocket creation (game initialization)
 */

// ============== Frontend RENDER =====================
/**
 * This adds a game element (includes a desk and two chairs) into the HTML
 */
function createGameElement(rootElement, gameId, p1NameStr, p2NameStr) {
    game = document.createElement("div");
    game.setAttribute("class", "game");
    game.id = gameId;
    rootElement.appendChild(game);

    p1 = document.createElement("div");
    p1Icon = document.createElement("div");
    p1Name = document.createElement("div"); p1Name.innerHTML = p1NameStr;
    p2 = document.createElement("div");
    p2Icon = document.createElement("div");
    p2Name = document.createElement("div"); p2Name.innerHTML = p2NameStr;
    desk = document.createElement("div");

    p1.setAttribute("class", "playerWrapper");
    p1Icon.setAttribute("class", p1NameStr == "" ? "playerIcon emptySeat" : "playerIcon");
    p1Name.setAttribute("class", "playerName");
    p2.setAttribute("class", "playerWrapper");
    p2Icon.setAttribute("class", p2NameStr == "" ? "playerIcon emptySeat" : "playerIcon");
    p2Name.setAttribute("class", "playerName");
    desk.setAttribute("class", "desk");

    p1.appendChild(p1Icon); p1.appendChild(p1Name);
    p2.appendChild(p2Icon); p2.appendChild(p2Name);

    if (p2NameStr == "") {
        p2Icon.addEventListener(
            "mouseenter",
            (event) => {
                // highlight the mouseenter target
                event.target.style.backgroundColor = "red";

                // reset the color after a short delay
                // setTimeout(() => {
                //     event.target.style.color = "";
                // }, 500);
            },
            false,
        );

        p2Icon.addEventListener(
            "mouseleave",
            (event) => {
                event.target.style.backgroundColor = "#ebf0ed";
            },
            false,
        );

        p2Icon.addEventListener(
            "click",
            (event) => {
                console.log("occupied!");
                // Extract the gameId of the game that the user choosed
                chosenGameId = event.target.parentElement.parentElement.id;
                sendToInitSocket("JOIN_" + chosenGameId);
            },
            false,
        );
    }

    game.appendChild(p1);
    game.appendChild(desk);
    game.appendChild(p2);
}

function renderHall(gameArr) {
    var hall = document.getElementById("hall");
    gameArr.forEach(e => {
        console.log("123".substring(0, 5));
        createGameElement(
            hall,
            e.gameId,
            (e.playerOneId ?? "").substring(0, 4),
            (e.playerTwoId ?? "").substring(0, 4)
        );
    });
}

function renderCurrentGameToHall(myPlayerId) {
    var hall = document.getElementById("hall");
    console.log("Add new game: " + localStorage.getItem("gameId"));
    createGameElement(
        hall,
        localStorage.getItem("gameId"),
        myPlayerId.substring(0, 4),
        ""
    );
}

// ============ Frontend RENDER ends====================

const connInit = new WebSocket("ws://localhost:8080/initGame");

function sendToInitSocket(message) {
    connInit.send(message);
}

function createInitGameSocket() {

    connInit.onopen = function (evt) {
        console.log("***ONOPEN");
    };

    connInit.onmessage = function (evt) {
        var msg = String(evt.data);
        console.log("Message received: " + msg);
        if (msg.startsWith("GAMES_")) {
            gameArr = JSON.parse(msg.substring(6));
            // TODO: display gameArr
            gameArr.forEach(e => console.log(e));
            renderHall(gameArr);
            // TODO: connInit.send("NEW") / connInit.send("JOIN"), according to user's choice
            // ...
        } else if (msg.startsWith("WAITING_")) {
            // TODO: display gameArr and wait
            // ...
            localStorage.setItem("gameId", msg.substring(8).split("_")[0]);
            myPlayerId = msg.substring(8).split("_")[1];
            renderCurrentGameToHall(myPlayerId);

        } else if (msg.startsWith("STARTED_")) {
            // msg FORMAT: STARTED_<gameId>_<playerRole>
            connInit.close();
            // TODO: display chess board
            // ...
            gameId = msg.split("_")[1];
            playerRole = msg.split("_")[2];
            console.log("STARTED: gameid=" + gameId + ", playerRole=" + playerRole);
            localStorage.setItem("gameId", gameId);
            localStorage.setItem("playerRole", playerRole);
            // Jump to gaming page
            setTimeout(() => window.location.href = "game-page.html", 1000);
        }
    };

    connInit.onerror = function (evt) {
        console.log("WebSocketError!");
    };

    connInit.onclose = function (evt) {
        console.log("***ONCLOSE");
    };
}

createInitGameSocket();

console.log("gameId: " + localStorage.getItem("gameId"));