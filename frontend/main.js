/**
 * This script has two functional parts:
 *  1. Frontend rendering (game hall)
 *  2. WebSocket creation (game initialization)
 * 
 * 
 * localStorage keys: `gameId`, `playerRole`
 */

// 性能考虑：存储games的数据结构设计为以状态(state)为维度，而不是以gameId为维度。这样可以避免经常遍历
const waitingGames = new Map();
const ongoingGames = new Map();

// ============== Frontend RENDER =====================

const highlightColor = function (event) {
    event.target.style.backgroundColor = "red";
}

const resetColor = function (event) {
    event.target.style.backgroundColor = "#ebf0ed";
}

const occupyPosition = function (event) {
    console.log("occupied!");
    // Extract the gameId of the game that the user choosed
    chosenGameId = event.target.parentElement.parentElement.id;
    sendToInitSocket("JOIN_" + chosenGameId);
}

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
        p2Icon.addEventListener("mouseenter", highlightColor, false);
        p2Icon.addEventListener("mouseleave", resetColor, false);
        p2Icon.addEventListener("click", occupyPosition, false);
    }

    game.appendChild(p1);
    game.appendChild(desk);
    game.appendChild(p2);
    return game;
}


function renderGameStateToOngoing(gameElement, p2NameStr) {

    if (p2NameStr == "") {
        console.error("Rendering game state to ongoing, but p2's name is empty!");
    }

    p2Wrapper = gameElement.getElementsByClassName("playerWrapper")[1];
    p2Icon = p2Wrapper.getElementsByClassName("playerIcon")[0];
    p2Name = p2Wrapper.getElementsByClassName("playerName")[0];

    // Remove class "emptySeat"
    p2Icon.setAttribute("class", "playerIcon");

    // Add player 2 name
    p2Name.innerHTML = p2NameStr;

    if (p2NameStr !== "") {
        p2Icon.removeEventListener("mouseenter", highlightColor, false);
        p2Icon.removeEventListener("mouseleave", resetColor, false);
        p2Icon.removeEventListener("click", occupyPosition, false);
    }

    // TODO: Move gameElement to the end of hall
}

function renderHall(gameArr) {
    // Games in waiting state are sorted front, which are then rendered in the front
    gameArr.sort((e1, e2) => e1.isStarted - e2.isStarted);
    gameArr.forEach(e => {
        gameElement = createGameElement(
            document.getElementById("hall"),
            e.gameId,
            (e.playerOneId ?? "").substring(0, 4),
            (e.playerTwoId ?? "").substring(0, 4)
        );
        e.isStarted ? ongoingGames.set(e.gameId, gameElement) : waitingGames.set(e.gameId, gameElement);
    });
}

// ======== Helper operational functions that wrap render functions ========

function addWaitingGameToHall(game) {
    console.log("+++ Add new game: " + game);
    gameElement = createGameElement(
        document.getElementById("hall"),
        game.gameId,
        (game.playerOneId ?? "").substring(0, 4),
        (game.playerTwoId ?? "").substring(0, 4)
    );
    waitingGames.set(game.gameId, gameElement);
}

function changeWaitingGameToOngoing(game) {
    console.log("+++ Remove waiting game: " + game);
    gameElement = waitingGames.get(game.gameId);
    waitingGames.delete(game.gameId);
    ongoingGames.set(game.gameId, gameElement);

    // TODO: needs to place the game at the end of games (use `appendChild`)
    renderGameStateToOngoing(
        gameElement,
        game.playerTwoId.substring(0, 4)
    );
}

function removeOngoingGame(gameId) {
    console.log("+++ game ended! " + gameId);
    // Remove from DOM
    ongoingGames.get(gameId).remove();
    ongoingGames.delete(gameId);
    console.log("+++ waiting games: " + waitingGames);
    console.log("+++ ongoing games: " + ongoingGames);
    
}

// ============ WebSocket for game hall ====================

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
            // render gameArr into hall
            gameArr.forEach(e => console.log(e));
            renderHall(gameArr);
            // ...Now, user can choose to create a new game or join an existed game, via connInit.send("NEW") or connInit.send("JOIN")
        
        } else if (msg.startsWith("WAITING_")) {
            // Cover a grey layer to block user operations
            document.getElementById("overlay").style.display = "block";
        
        } else if (msg.startsWith("STARTED_")) {
            // msg FORMAT: STARTED_<gameId>_<playerRole>
            connInit.close();
            gameId = msg.split("_")[1];
            playerRole = msg.split("_")[2];
            console.log("STARTED: gameid=" + gameId + ", playerRole=" + playerRole);
            // When game starts, gameId and playerRole is distributed by server
            localStorage.setItem("gameId", gameId);
            localStorage.setItem("playerRole", playerRole);
            // Jump to gaming page
            setTimeout(() => window.location.href = "game-page.html", 1000);
            // Discover the grey layer
            // TODO: more animation :)
            document.getElementById("overlay").style.display = "none";
        } else if (msg.startsWith("ADD_GAME_")) {
            game = JSON.parse(msg.substring(9));
            addWaitingGameToHall(game);
        } else if (msg.startsWith("START_GAME_")) {
            game = JSON.parse(msg.substring(11));
            changeWaitingGameToOngoing(game);
        } else if (msg.startsWith("END_GAME_")) {
            gameId = msg.substring(9);
            removeOngoingGame(gameId);
        }
    };

    connInit.onerror = function (evt) {
        console.log("WebSocketError!");
    };

    connInit.onclose = function (evt) {
        console.log("***ONCLOSE");
    };
}


/**
 * Game hall page entered or refreshed 
 * (every time page is loaded, a new initGame websocket will be created, renders the gameArr received from server.)
 */
function loadHall() {
    createInitGameSocket();
}

loadHall();

console.log("gameId: " + localStorage.getItem("gameId"));