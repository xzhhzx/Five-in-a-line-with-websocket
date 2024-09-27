import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

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

    private static Gson gson = new GsonBuilder()
//            .setPrettyPrinting()
            .excludeFieldsWithoutExposeAnnotation()
            .serializeNulls()
            .create();

    private GameStorage() {}

    public static ConcurrentHashMap<String, Game> getAllGames() {
//        if (allGames == null) {
//            synchronized (GameStorage.class) {
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

    public static String toJsonString(Game game) {
        return gson.toJson(game);
    }
}