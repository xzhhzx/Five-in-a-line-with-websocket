# Five-in-a-line-with-websocket

### Backend
Start with command:

```shell script
mvn jetty:run
```



### Types of Message

| Message     | Direction | Meaning                                                      |
| ----------- | --------- | ------------------------------------------------------------ |
| GAMES_      | S -> C    | Distribute current games to connected clients                |
| NEW         | C -> S    | Create new game                                              |
| WAITING_    | S -> C    | You may wait for an opponent...                              |
| ADD_GAME_   | S -> C    | Broadcast waiting game to clients (in order for them to update their front-end) |
| JOIN_       | C -> S    | Join an existed game                                         |
| STARTED_    | S -> C    | You two can start the game!                                  |
| START_GAME_ | S -> C    | Broadcast started game to clients (in order for them to update their front-end) |
| CONN_       | C -> S    | Player request to connect to game                            |
| SYNC_       | C -> S    | Player synchronize its move to opponent                      |
| DISCONN_    | C -> S    | Player request to disconnect to game                         |
| END_GAME_   | S -> C    | Broadcast ended game to clients (in order for them to update their front-end) |