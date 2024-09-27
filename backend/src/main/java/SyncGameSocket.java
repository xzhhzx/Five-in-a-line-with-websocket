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
        if (message.startsWith("CONN_")) {
            // Message format: "CONN_<gameId>_<playerRole>"
            String[] fields = message.substring(5).split("_");
            String gameId = fields[0];
            String playerRole = fields[1];
            Game g = GameStorage.getAllGames().get(gameId);

            if ("p1".equals(playerRole)) {
                g.setPlayerOneSyncSession(session);
                g.setPlayerOneConnected(true);
            } else if ("p2".equals(playerRole)) {
                g.setPlayerTwoSyncSession(session);
                g.setPlayerTwoConnected(true);
            } else {
                throw new Exception("CONN: Unsupported playerRole: " + playerRole);
            }
        } else if (message.startsWith("DISCONN_")) {
            // Message format: "DISCONN_<gameId>_<playerRole>"
            String[] fields = message.substring(8).split("_");
            String gameId = fields[0];
            String playerRole = fields[1];
            Game g = GameStorage.getAllGames().get(gameId);

            if ("p1".equals(playerRole)) {
                g.setPlayerOneConnected(false);
            } else if ("p2".equals(playerRole)) {
                g.setPlayerTwoConnected(false);
            } else {
                throw new Exception("DISCONN: Unsupported playerRole: " + playerRole);
            }

            // TODO: 是否需要并发控制？@Transactional
            // Check if both players disconnected. If yes, then...
            if (!g.isPlayerOneConnected()
                && !g.isPlayerTwoConnected()) {
                // 1. for other users (except p1 and p2), broadcast an END_GAME message
                for (Session e : session.getOpenSessions()) {
                    if ("/initGame".equals(e.getRequestURI().getPath())) {
                        System.out.println("===== broadcast END_GAME to session: " + e.getId());
                        e.getBasicRemote().sendText("END_GAME_" + gameId);
                    }
                }

                // TODO: 这里需不需要发送额外的挥手消息？（比如网络通信问题导致客户端侧没有关闭session）
                // 2. close both players' WebSocket session
                // 考虑到一致性（实际状态与GameStorage一致），两个玩家的session关闭应该由服务端发起（如果由客户端发起，可能会造成一些不可控的现象？）
                g.getPlayerOneSyncSession().close();
                g.getPlayerTwoSyncSession().close();

                // 3. remove game from GameStorage
                GameStorage.getAllGames().remove(gameId);
            }

        } else if (message.startsWith("SYNC_")) {
            // Message format: "SYNC_<gameId>_<playerRole>_<x>_<y>"
            String[] fields = message.substring(5).split("_");
            String gameId = fields[0];
            String playerRole = fields[1];
            String x = fields[2];
            String y = fields[3];

            Game g = GameStorage.getAllGames().get(gameId);

            if (null == g) {
                throw new Exception("Game not found in HashMap!");
            }

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
        System.out.println("Closing a WebSocket: " + reason);
    }
}