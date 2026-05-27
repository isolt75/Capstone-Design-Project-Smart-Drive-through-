package DT_DB.test.controller;

import DT_DB.test.Cust;
import DT_DB.test.Menu;
import DT_DB.test.MenuRepository;
import DT_DB.test.Odr;
import DT_DB.test.OdrRepository;

import DT_DB.test.dto.OrderItemDto;
import DT_DB.test.dto.OrderRequest;

import DT_DB.test.repository.CustRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/orders")

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

public class OrderController {

    private final CustRepository custRepo;
    private final MenuRepository menuRepo;
    private final OdrRepository odrRepo;

    public OrderController(
            CustRepository custRepo,
            MenuRepository menuRepo,
            OdrRepository odrRepo
    ) {
        this.custRepo = custRepo;
        this.menuRepo = menuRepo;
        this.odrRepo = odrRepo;
    }

    // =========================
    // 직원용 주문 목록 조회
    // =========================
    @GetMapping
    public ResponseEntity<?> getOrders() {

        try {

            List<Odr> odrs =
                    odrRepo.findAllByOrderByOdrTimeDesc();

            Map<String, Map<String, Object>> grouped =
                    new LinkedHashMap<>();

            for (Odr odr : odrs) {

                String orderNum =
                        odr.getOrderNumber();

                // 주문번호별 그룹 생성
                if (!grouped.containsKey(orderNum)) {

                    Map<String, Object> order =
                            new HashMap<>();

                    order.put(
                            "orderNum",
                            orderNum
                    );

                    order.put(
                            "customerId",
                            odr.getCustNum()
                    );

                    order.put(
                            "items",
                            new ArrayList<>()
                    );

                    grouped.put(
                            orderNum,
                            order
                    );
                }

                // item 추가
                List<Map<String, Object>> items =
                        (List<Map<String, Object>>)
                                grouped
                                        .get(orderNum)
                                        .get("items");

                Map<String, Object> item =
                        new HashMap<>();

                item.put(
                        "id",
                        odr.getMenuNum()
                );

                item.put(
                        "name",
                        odr.getOdrNm()
                );

                item.put(
                        "quantity",
                        odr.getMenuCnt()
                );

                items.add(item);
            }

            return ResponseEntity.ok(
                    grouped.values()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()
                    ));
        }
    }

    // =========================
    // 주문 생성
    // =========================
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest req
    ) {

        try {

            // 요청 null 체크
            if (req == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "요청 데이터 없음"
                        ));
            }

            // 차량번호 체크
            if (req.getPlate() == null ||
                    req.getPlate().isBlank()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "차량번호 누락"
                        ));
            }

            // 주문 목록 체크
            if (req.getItems() == null ||
                    req.getItems().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "주문 항목 없음"
                        ));
            }

            // 고객 조회
            Optional<Cust> optionalCust =
                    custRepo.findByCarNum(
                            req.getPlate()
                    );

            Cust cust;

            // 신규 고객 저장
            if (optionalCust.isEmpty()) {

                cust = new Cust();

                cust.setCarNum(
                        req.getPlate()
                );

                cust = custRepo.save(cust);

            } else {

                cust = optionalCust.get();
            }

            // 주문번호 생성
            LocalDate today = LocalDate.now();

            long countToday =
                    odrRepo.countByOdrTimeBetween(
                            today.atStartOfDay(),
                            today.plusDays(1).atStartOfDay()
                    );

            long nextNumber = countToday + 1;

            String orderNumber =
                    String.format("%03d", nextNumber);

            // 주문 저장
            for (OrderItemDto item : req.getItems()) {

                Menu menu = menuRepo.findById(
                        item.getMenuId()
                ).orElse(null);

                // 메뉴 없음
                if (menu == null) {

                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "success", false,
                                    "message",
                                    "존재하지 않는 메뉴 ID : "
                                            + item.getMenuId()
                            ));
                }

                // 수량 오류
                if (item.getQuantity() <= 0) {

                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "success", false,
                                    "message", "잘못된 수량"
                            ));
                }

                // 주문 저장
                Odr odr = new Odr(
                        menu.getMenuNm(),
                        cust.getCustNum(),
                        LocalDateTime.now(),
                        menu.getMenuNum(),
                        item.getQuantity(),
                        orderNumber
                );

                odrRepo.save(odr);
            }

            // 응답
            Map<String, Object> result =
                    new HashMap<>();

            result.put("success", true);

            result.put(
                    "customerId",
                    cust.getCustNum()
            );

            result.put(
                    "plate",
                    cust.getCarNum()
            );

            result.put(
                    "orderNumber",
                    orderNumber
            );

            result.put(
                    "orderTime",
                    LocalDateTime.now().toString()
            );

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()
                    ));
        }
    }
}