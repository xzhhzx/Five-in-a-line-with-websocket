import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * GameStorage class
 * description: TODO
 *
 * @author User
 * @date 2024/9/19
 */
public class GameStorage {

    private static ConcurrentHashMap<String, Game> allGames = new ConcurrentHashMap<>(16);
    private static Integer lock;

    private static Gson gson = new GsonBuilder()
//            .setPrettyPrinting()
            .excludeFieldsWithoutExposeAnnotation()
            .serializeNulls()
            .create();

    private GameStorage() {}

    public static ConcurrentHashMap<String, Game> getAllGames() {
//        if (allGames == null) {
//            synchronized (lock) {
//                if (allGames == null) {
//                    allGames = new ConcurrentHashMap<>(16);
//                }
//            }
//        }
        return allGames;
    }

    public static void newGame() {

    }

    public static String getAllGamesString() {
        Game g0 = new Game(); g0.setGameId(UUID.randomUUID()); g0.setStarted(true);
        Game g1 = new Game(); g1.setGameId(UUID.randomUUID());
//        allGames.put("456", g0);
//        allGames.put("789", g1);
        System.out.println("allGames.size(): " + allGames.size());

        return gson.toJson(allGames.values());

        // Optional: more fine-tuned output message
//        return allGames.values().stream()
//                .sorted(Comparator.comparing(Game::isStarted))
//                .map(e -> {
//                    System.out.println(e);
//                    return gson.toJson(e);
//                })
//                .reduce("", (a, b) -> a + "|" + b);
    }
}