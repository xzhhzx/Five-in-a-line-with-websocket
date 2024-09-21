import com.google.gson.annotations.Expose;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.websocket.Session;
import java.util.UUID;

/**
 * Game class
 * description: TODO
 *
 * @author User
 * @date 2024/9/19
 */
@Data
@NoArgsConstructor
public class Game {

    @Expose
    private UUID gameId;
    // TODO: can be removed, since isStarted can be derived
    @Expose
    private boolean isStarted;
    private short numPlayers;

    @Expose
    private UUID playerOneId;
    @Expose
    private UUID playerTwoId;
    private Session playerOneInitSession;
    private Session playerOneSyncSession;
    private Session playerTwoSyncSession;

}