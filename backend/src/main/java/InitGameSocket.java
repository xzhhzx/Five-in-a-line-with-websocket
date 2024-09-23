import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.UUID;

@ServerEndpoint("/initGame")
public class InitGameSocket {

    @OnOpen
    public void onOpen(Session session) throws IOException {
        System.out.println("WebSocket opened: " + session.getId());
        session.getBasicRemote().sendText("GAMES_" + GameStorage.getAllGamesString());
//        session.getBasicRemote().sendText("GAMES_" + GameStorage.getAllGames().toString());
    }

    @OnMessage
    public void onMessage(String message, Session session) throws Exception {
        System.out.println("Message received: " + message);
        if (message.startsWith("NEW")) {
            UUID gameId = UUID.randomUUID();
            UUID playerOneId = UUID.randomUUID();
            Game g = new Game();
            g.setGameId(gameId);
            g.setPlayerOneId(playerOneId);
            g.setPlayerOneInitSession(session);
            g.setStarted(false);
            GameStorage.getAllGames().put(gameId.toString(), g);
            session.getBasicRemote().sendText("WAITING_" + gameId.toString() + "_" + playerOneId);

        } else if (message.startsWith("JOIN_")) {
            String existedGameId = message.split("_")[1];
            Game existedGame = GameStorage.getAllGames().get(existedGameId);
            if (null == existedGame) {
                throw new Exception("gameId " + existedGameId + " does not exist!");
            }
            UUID playerTwoId = UUID.randomUUID();
            existedGame.setPlayerTwoId(playerTwoId);
            existedGame.setStarted(true);

            // create new WebSocket for game sync (不复用当前WebSocket，因为保证逻辑解耦，这样如果以后要替换成peer-to-peer比较方便)
            // So, give both clients a notification for creating a new WebSocket to "/sync"
            // TODO: possibly a bug here! It seems that sometimes playerOneInitSession is already closed before invoking its sendText.
            session.getBasicRemote().sendText("STARTED_" + existedGameId + "_p2");
            existedGame.getPlayerOneInitSession().getBasicRemote().sendText("STARTED_" + existedGameId + "_p1");

            // ...Until now, this socket (together with the opponent's initSocket) can be closed (done by client)
        } else {
            System.out.println("warning: unsupported message!");
        }
    }

    @OnClose
    public void onClose(CloseReason reason, Session session) {
        System.out.println("Closing a WebSocket due to " + reason.getReasonPhrase());
    }
}