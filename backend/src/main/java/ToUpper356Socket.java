/**
 * ToUpper356Socket class
 * description: TODO
 *
 * @author User
 * @date 2024/9/19
 */

import java.io.IOException;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/jsr356toUpper")
public class ToUpper356Socket {

    @OnOpen
    public void onOpen(Session session) {
        System.out.println("WebSocket opened: " + session.getId() + ", URI: " + session.getRequestURI());
        session.getUserProperties().forEach((k, v) -> {
            System.out.println("  k: " + k + ", v:" + v);
        });
    }

    @OnMessage
    public void onMessage(String txt, Session session) throws IOException, InterruptedException {
        System.out.println("Message received: " + txt);
        Thread.sleep(1000);
        session.getBasicRemote().sendText(txt.toUpperCase());
    }

    @OnClose
    public void onClose(CloseReason reason, Session session) {
        System.out.println("Closing a WebSocket due to " + reason.getReasonPhrase());
    }
}