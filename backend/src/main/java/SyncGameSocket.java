import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/syncGame")
public class SyncGameSocket {

    @OnOpen
    public void onOpen(Session session) {
        System.out.println("syncGame-WebSocket opened: " + session.getId());
    }

    @OnMessage
    public void onMessage(String message, Session session) throws Exception {
        System.out.println("Message received: " + message);
        if (message.startsWith("CONN_GAME_")) {
            // Message format: "CONN_GAME_<gameId>_<playerRole>"
            String[] fields = message.substring(10).split("_");
            String gameId = fields[0];
            String playerRole = fields[1];

            if ("p1".equals(playerRole)) {
                GameStorage.getAllGames().get(gameId).setPlayerOneSyncSession(session);
            } else if ("p2".equals(playerRole)) {
                GameStorage.getAllGames().get(gameId).setPlayerTwoSyncSession(session);
            } else {
                throw new Exception("CONN_GAME: Unsupported playerRole: " + playerRole);
            }
        } else if (message.startsWith("DISCONN_GAME_")) {
            // Message format: "DISCONN_GAME_<gameId>_<playerRole>"
            String[] fields = message.substring(13).split("_");
            String gameId = fields[0];
            String playerRole = fields[1];

            if ("p1".equals(playerRole)) {
                GameStorage.getAllGames().get(gameId).setPlayerOneSyncSession(null);
            } else if ("p2".equals(playerRole)) {
                GameStorage.getAllGames().get(gameId).setPlayerTwoSyncSession(null);
            } else {
                throw new Exception("DISCONN_GAME: Unsupported playerRole: " + playerRole);
            }
        } else if (message.startsWith("SYNC_")) {
            // Message format: "SYNC_<gameId>_<playerRole>_<x>_<y>"
            String[] fields = message.substring(5).split("_");
            String gameId = fields[0];
            String playerRole = fields[1];
            String x = fields[2];
            String y = fields[3];

            Game g = GameStorage.getAllGames().get(gameId);

            if ("p1".equals(playerRole)) {
                // TODO: (optimization) the send-out message could be shortened
                g.getPlayerTwoSyncSession().getBasicRemote().sendText(message);
            } else {
                g.getPlayerOneSyncSession().getBasicRemote().sendText(message);
            }
        } else {
            throw new Exception("Unsupported message: " + message);
        }
    }

    @OnClose
    public void onClose(CloseReason reason, Session session) {
        System.out.println("Closing a WebSocket due to " + reason.getReasonPhrase());
    }
}