package DT_DB.test.controller;

import DT_DB.test.Cust;
import DT_DB.test.CustRepository;
import DT_DB.test.Menu;
import DT_DB.test.MenuRepository;
import DT_DB.test.Odr;
import DT_DB.test.OdrRepository;

import DT_DB.test.dto.OrderItemDto;
import DT_DB.test.dto.OrderRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")

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

    // 테스트 API
    @GetMapping
    public ResponseEntity<?> test() {

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Order API 정상 실행 중"
                )
        );
    }

    // 주문 생성
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest req
    ) {

        try {

            System.out.println("===== 주문 요청 =====");
            System.out.println(req);

            // 요청 null 체크
            if (req == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "요청 데이터 없음"
                        ));
            }

            // 고객명 체크
            if (req.getCustomerName() == null ||
                    req.getCustomerName().isBlank()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "고객명 누락"
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

            // 기존 고객 조회
            Cust cust = custRepo.findByCarNum(
                    req.getPlate()
            );

            // 신규 고객 저장
            if (cust == null) {

                cust = new Cust();

                cust.setCustNm(
                        req.getCustomerName()
                );

                cust.setCarNum(
                        req.getPlate()
                );

                custRepo.save(cust);
            }

            // 주문 저장
            for (OrderItemDto item : req.getItems()) {

                // 메뉴 조회
                Menu menu = menuRepo.findById(
                        item.getMenuId()
                ).orElse(null);

                // 메뉴 없을 경우
                if (menu == null) {

                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "success", false,
                                    "message",
                                    "존재하지 않는 메뉴 ID : "
                                            + item.getMenuId()
                            ));
                }

                // 수량 체크
                if (item.getQuantity() <= 0) {

                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "success", false,
                                    "message", "잘못된 수량"
                            ));
                }

                // 주문 저장
                Odr odr = new Odr(
                        menu.getMenuNm() + " 주문",
                        cust.getCustNum(),
                        LocalDateTime.now(),
                        menu.getMenuNum(),
                        item.getQuantity()
                );

                odrRepo.save(odr);
            }

            // 응답 데이터
            Map<String, Object> result =
                    new HashMap<>();

            result.put("success", true);

            result.put(
                    "customerId",
                    cust.getCustNum()
            );

            result.put(
                    "customerName",
                    cust.getCustNm()
            );

            result.put(
                    "plate",
                    cust.getCarNum()
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