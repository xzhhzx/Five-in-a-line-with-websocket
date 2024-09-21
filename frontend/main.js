
const N = 10;
var matrix = Array(N).fill().map(() => Array(N).fill(0));

// Dynamically create a table
function createGameBoard() {
    // get the reference for the gameBoard placeholder
    var gameboard = document.getElementById("gameboard");

    // create <table> and <tbody> element
    table = document.createElement("table");
    table.id = "mtable";
    gameboard.appendChild(table);
    tbody = document.createElement("tbody");
    table.appendChild(tbody);

    // creating all cells
    for (var j = 0; j < N; j++) {
        // create a <tr> element and append the row <tr> into <tbody>
        row = document.createElement("tr");
        row.setAttribute("class", "row")
        tbody.appendChild(row);

        for (var i = 0; i < N; i++) {
            // create a <td> element and append the cell <td> into the row <tr>
            cell = document.createElement("td");
            cell.id = j + "_" + i;
            cell.setAttribute("class", "cell")
            row.appendChild(cell);

            // create an <img> element and place inside the <td> element
            img = document.createElement('img');
            img.id = j + "_" + i + "_img";
            img.src = "./image/grid.png";
            img.setAttribute("class", "cell_img");
            cell.appendChild(img)
        }
    }
    // sets the border attribute of table to 2;
    // table.setAttribute("border","2");  
}

function isWin(x, y, player) {

    console.log("isWin");
    // 1.horizontal
    var i = y - 1;
    var j = y + 1;
    while (i >= 0 && matrix[x][i] === player) {
        i--;
    }

    while (j < N && matrix[x][j] === player) {
        j++;
    }

    console.log(j - i - 1);
    if (j - i - 1 === 5) {
        return true;
    }


    // 2.vertical
    i = x - 1;
    j = x + 1;

    while (i >= 0 && matrix[i][y] === player) {
        i--;
    }

    while (j < N && matrix[j][y] === player) {
        j++;
    }

    console.log(j - i - 1);
    if (j - i - 1 === 5) {
        return true;
    }

    // 3. -45 degrees
    var ix = x - 1;
    var iy = y - 1;
    var jx = x + 1;
    var jy = y + 1;

    while (ix >= 0 && iy >= 0 && matrix[ix][iy] === player) {
        ix--;
        iy--;
    }

    while (jx < N && jy < N && matrix[jx][jy] === player) {
        jx++;
        jy++;
    }

    console.log(jx - ix - 1);
    if (jx - ix - 1 === 5) {
        return true;
    }

    // 4. 45 degrees
    var ix = x - 1;
    var iy = y + 1;
    var jx = x + 1;
    var jy = y - 1;

    while (ix >= 0 && iy < N && matrix[ix][iy] === player) {
        ix--;
        iy++;
    }

    while (jx < N && jy >= 0 && matrix[jx][jy] === player) {
        jx++;
        jy--;
    }

    console.log(jx - ix - 1);
    if (jx - ix - 1 === 5) {
        return true;
    }
}

function resetGame() {
    document.querySelectorAll(".cell_img").forEach((e) => {
        e.src = "./image/grid.png";
    });

    matrix = Array(N).fill(0).map(x => Array(N).fill(0));
}

function showChessShadow_img(cell_img) {
    let x = cell_img.id.split('_')[0];
    let y = cell_img.id.split('_')[1];

    if (matrix[x][y] === 0) {
        let player = 1;
        if (player === 1)
            cell_img.src = "./image/grid_chess_black_TP.png";
        else
            cell_img.src = "./image/grid_chess_white_TP.png";
    }
}

function unshowChessShadow_img(cell_img) {
    let x = cell_img.id.split('_')[0];
    let y = cell_img.id.split('_')[1];

    if (matrix[x][y] === 0) {
        cell_img.src = "./image/grid.png";
    }
}

function putChess(cell_img) {
    let x = parseInt(cell_img.id.split('_')[0]);
    let y = parseInt(cell_img.id.split('_')[1]);

    const request = new Request(`http://127.0.0.1:8080/send_xy?gameId=001&playerId=aaa&x=${x}&y=${y}`, {
        method: "POST",
        body: "",
        // headers: headers,
        // mode: 'no-cors'
    });


    fetch(request)
        .then((resp) => {
            if (resp.status === 200) {
                return resp.text();
            } else {
                throw new Error("Something went wrong on API server!");
            }
        })
        .then((respBody) => {
            console.log("=== " + respBody);
        })
        .catch((error) => {
            console.error(error);
        });

    let player = 1;
    if (matrix[x][y] === 0) {
        console.log('Player ' + player + ' confirms chess position: ' + cell_img.id);
        matrix[x][y] = player;      // Modify underlying data structure
        cell_img.src = "./image/grid_chess_black.png";    // Modify image
        // turn = 'B';   // Switch turn
    } else {
        window.alert("Already occupied!");
    }

    if (isWin(x, y, player)) {
        window.alert("Player " + player + " wins!");
        resetGame();
    }
}

function putChessWebSocket(cell_img) {
    let player = 1;
    let x = parseInt(cell_img.id.split('_')[0]);
    let y = parseInt(cell_img.id.split('_')[1]);

    // TODO
    const exampleSocket = new WebSocket(
        "wss://localhost:8080/socketserver",
        "protocolOne",
    );


    if (matrix[x][y] === 0) {
        console.log('Player ' + player + ' confirms chess position: ' + cell_img.id);
        matrix[x][y] = player;      // Modify underlying data structure
        cell_img.src = "./image/grid_chess_black.png";    // Modify image
        // turn = 'B';   // Switch turn
    } else {
        window.alert("Already occupied!");
    }

    if (isWin(x, y, player)) {
        window.alert("Player " + player + " wins!");
        resetGame();
    }
}

function main() {
    createGameBoard();
    table.querySelectorAll(".cell_img").forEach(cell_img => {
        // console.log(cell_img);
        cell_img.addEventListener('mouseenter', () => showChessShadow_img(cell_img));
        cell_img.addEventListener('mouseout', () => unshowChessShadow_img(cell_img));
        cell_img.addEventListener('click', () => putChess(cell_img));
    });

    console.log(matrix);
}

// main();

// =================================================
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

// ============== RENDER =====================

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

console.log("gameId: " + localStorage.getItem("gameId"));

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

// renderHall();

// ============RENDER ends=======================

// import { Client } from '@stomp/stompjs';
// const stompClient = new Client({
//     brokerURL: 'ws://localhost:8080/gs-guide-websocket'
// });

// stompClient.onConnect = (frame) => {
//     setConnected(true);
//     console.log('Connected: ' + frame);
//     stompClient.subscribe('/topic/greetings', (greeting) => {
//         showGreeting(JSON.parse(greeting.body).content);
//     });
// };

// stompClient.onWebSocketError = (error) => {
//     console.error('Error with websocket', error);
// };

// stompClient.onStompError = (frame) => {
//     console.error('Broker reported error: ' + frame.headers['message']);
//     console.error('Additional details: ' + frame.body);
// };

// function setConnected(connected) {
//     $("#connect").prop("disabled", connected);
//     $("#disconnect").prop("disabled", !connected);
//     if (connected) {
//         $("#conversation").show();
//     }
//     else {
//         $("#conversation").hide();
//     }
//     $("#greetings").html("");
// }

// function connect() {
//     stompClient.activate();
// }

// function disconnect() {
//     stompClient.deactivate();
//     setConnected(false);
//     console.log("Disconnected");
// }

// function sendName() {
//     stompClient.publish({
//         destination: "/app/hello",
//         body: JSON.stringify({'name': $("#name").val()})
//     });
// }

// function showGreeting(message) {
//     $("#greetings").append("<tr><td>" + message + "</td></tr>");
// }

// $(function () {
//     $("form").on('submit', (e) => e.preventDefault());
//     $( "#connect" ).click(() => connect());
//     $( "#disconnect" ).click(() => disconnect());
//     $( "#send" ).click(() => sendName());
// });

