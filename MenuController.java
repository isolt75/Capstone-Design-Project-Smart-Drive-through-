package DT_DB.test;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
//@RequestMapping("/api")

@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS
        }
)

public class MenuController {

    private final MenuRepository menuRepo;

    public MenuController(MenuRepository menuRepo) {
        this.menuRepo = menuRepo;
    }

    /**
     * 전체 메뉴 조회
     * GET /api/menus
     */
    @GetMapping("/menus")
    public Map<String, Object> getMenus() {

        List<Menu> menus = menuRepo.findAll();

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (Menu menu : menus) {

            Map<String, Object> map =
                    new HashMap<>();

            map.put(
                    "menuId",
                    menu.getMenuNum()
            );

            map.put(
                    "menuName",
                    menu.getMenuNm()
            );

            map.put(
                    "price",
                    menu.getMenuPrice()
            );

            map.put(
                    "category",
                    menu.getMenuCategory()
            );

            map.put(
                    "cafYn",
                    menu.getCafYn()
            );

            result.add(map);
        }

        return Map.of(
                "success", true,
                "menus", result
        );
    }

    /**
     * 인기 메뉴 TOP3
     * GET /api/popular
     */
    @GetMapping("/popular")
    public Map<String, Object> getPopularMenus() {

        List<Menu> menus = menuRepo.findAll();

        List<Map<String, Object>> result =
                new ArrayList<>();

        int count = 0;

        for (Menu menu : menus) {

            if (count >= 3) break;

            Map<String, Object> map =
                    new HashMap<>();

            map.put(
                    "menuId",
                    menu.getMenuNum()
            );

            map.put(
                    "menuName",
                    menu.getMenuNm()
            );

            map.put(
                    "price",
                    menu.getMenuPrice()
            );

            map.put(
                    "category",
                    menu.getMenuCategory()
            );

            map.put(
                    "cafYn",
                    menu.getCafYn()
            );

            result.add(map);

            count++;
        }

        return Map.of(
                "success", true,
                "top3", result
        );
    }

    /**
     * 메뉴 단건 조회
     * GET /api/menus/{id}
     */
    @GetMapping("/menus/{id}")
    public Object getMenu(
            @PathVariable int id
    ) {

        Optional<Menu> optionalMenu =
                menuRepo.findById(id);

        if (optionalMenu.isEmpty()) {

            return Map.of(
                    "success", false,
                    "message", "메뉴 없음"
            );
        }

        Menu menu = optionalMenu.get();

        Map<String, Object> map =
                new HashMap<>();

        map.put(
                "menuId",
                menu.getMenuNum()
        );

        map.put(
                "menuName",
                menu.getMenuNm()
        );

        map.put(
                "price",
                menu.getMenuPrice()
        );

        map.put(
                "category",
                menu.getMenuCategory()
        );

        map.put(
                "cafYn",
                menu.getCafYn()
        );

        return map;
    }
}