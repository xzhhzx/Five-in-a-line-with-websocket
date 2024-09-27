/**
 * This script has two functional parts:
 *  1. Frontend rendering (game board)
 *  2. WebSocket creation (synchronizing move to opponent)
 */

const N = 10;
var matrix = Array(N).fill().map(() => Array(N).fill(0));
var isMyTurn = false;

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

    // Create all cells
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

    // Add event listeners
    table.querySelectorAll(".cell_img").forEach(cell_img => {
        // console.log(cell_img);
        cell_img.addEventListener('mouseenter', () => { if (isMyTurn == true) { showChessShadow_img(cell_img); } });
        cell_img.addEventListener('mouseout', () => { if (isMyTurn == true) { unshowChessShadow_img(cell_img); } });
        cell_img.addEventListener('click', () => { if (isMyTurn == true) { makeMove(cell_img); } });
    });
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

function makeMove(cell_img) {
    // 1.Render chess board
    putChess(
        cell_img.id.split('_')[0],
        cell_img.id.split('_')[1],
        localStorage.getItem("playerRole")
    );

    // 2.Send SYNC message to opponent
    syncToOpponent(
        cell_img.id.split('_')[0],
        cell_img.id.split('_')[1]
    );
}

// TODO: this function can be used for both the current player and the opponent
// however, for the current player, `document.getElementById` is not needed. This may decrease efficiency 
function putChess(x, y, playerRole) {

    let cellImgElement = document.getElementById(x + "_" + y + "_img");
    x = parseInt(x);
    y = parseInt(y);
    let player = parseInt(playerRole.substring(1));

    console.warn("=== player: " + player);
    console.warn("=== cellImgElement: " + cellImgElement);

    if (matrix[x][y] === 0) {
        console.log('Player ' + player + ' confirms chess position: ' + x + ", " + y);
        matrix[x][y] = player;      // Modify underlying data structure
        if (player === 1) {
            console.warn("=== put player 1 ");
            cellImgElement.src = "./image/grid_chess_black.png";    // Modify image
        } else if (player === 2) {
            console.warn("=== put player 2 ");
            cellImgElement.src = "./image/grid_chess_white.png";    // Modify image
        }
        isMyTurn = !isMyTurn;
        console.log("isMyTurn flipped to: " + isMyTurn);
        updatePromptText();
    } else {
        window.alert("Already occupied!");
    }

    if (isWin(x, y, player)) {
        // TODO: change to unblocked alert
        setTimeout(
            e => {
                window.alert("Player " + player + " wins!");
            }, 500
        )
        
        conn.send(
            "DISCONN_"
            + localStorage.getItem("gameId") + "_"
            + localStorage.getItem("playerRole")
        );

        // 改为由服务端发起
        // conn.close();

        // TODO: add feature: restart game according to both users' choice
        // resetGame();
    }
}


function updatePromptText() {
    if (isMyTurn == true) {
        document.getElementById("prompt").innerHTML = "Make a move!"
    } else {
        document.getElementById("prompt").innerHTML = "Waiting for opponent to take turn..."
    }
}

// =================================================

const conn = new WebSocket("ws://localhost:8080/syncGame");

// TODO: need to have a conn/disconn state in order to detect if server and opponent are both connected
// TODO: may be optimized into peer-to-peer communication in the future
function createSyncGameSocket() {
    conn.onopen = function (evt) {
        console.log("***ONOPEN: created sync-WebSocket");
        conn.send(
            "CONN_"
            + localStorage.getItem("gameId") + "_"
            + localStorage.getItem("playerRole")
        );
        createGameBoard();

        // Set isMyTurn according to playerRole (p1 goes first)
        if (localStorage.getItem("playerRole") == "p1") {
            isMyTurn = true;
        }
        updatePromptText();
    };

    conn.onmessage = function (evt) {
        // Message format: "SYNC_<gameId>_<playerRole>_<x>_<y>"
        var msg = evt.data;
        console.log("**Message received: " + msg);
        // TODO: update and re-render chess board
        opponentPlayerRole = msg.substring(5).split("_")[1];
        x = msg.substring(5).split("_")[2];
        y = msg.substring(5).split("_")[3];
        putChess(x, y, opponentPlayerRole);
    };

    conn.onerror = function (evt) {
        console.log("WebSocketError!");
    };

    conn.onclose = function (evt) {
        console.log("***ONCLOSE");
        // Game ended. Jump back to index page
        setTimeout(() => window.location.href = "index.html", 1000);
    };
}

function syncToOpponent(x, y) {
    // Message format: "SYNC_<gameId>_<playerRole>_<x>_<y>"
    message =
        "SYNC_"
        + localStorage.getItem("gameId") + "_"
        + localStorage.getItem("playerRole") + "_"
        + x + "_"
        + y;
    console.log("syncToOpponent message: " + message);
    conn.send(message);
}

console.log("gameId: " + localStorage.getItem("gameId"));

createSyncGameSocket();