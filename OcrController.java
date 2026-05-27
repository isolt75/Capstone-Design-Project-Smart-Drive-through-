package DT_DB.test.controller;

import DT_DB.test.repository.CustRepository;
import DT_DB.test.Cust;
import DT_DB.test.dto.OcrRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/ocr")

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

public class OcrController {

    @Autowired
    private CustRepository custRepository;

    // 가장 최근 OCR 번호 저장
    private String latestPlate = "";

    // =========================
    // GET : 최근 차량번호 조회
    // =========================
    @GetMapping("/receive")
    public Map<String, Object> getPlate() {

        Map<String, Object> result =
                new HashMap<>();

        String plate = latestPlate;

        // OCR 값 없으면 DB 최신값 사용
        if (plate == null || plate.isBlank()) {

            Optional<Cust> latestCustomer =
                    custRepository
                            .findTopByOrderByCustNumDesc();

            if (latestCustomer.isPresent()) {

                plate =
                        latestCustomer
                                .get()
                                .getCarNum();
            }
        }

        result.put("success", true);
        result.put("plate", plate);

        return result;
    }

    // =========================
    // POST : OCR 차량번호 수신
    // =========================
    @PostMapping("/receive")
    public Object receivePlate(
            @RequestBody OcrRequest request
    ) {

        Map<String, Object> result =
                new HashMap<>();

        // null 체크
        if (request == null ||
                request.getPlate() == null ||
                request.getPlate().trim().isEmpty()) {

            result.put("success", false);
            result.put("message", "plate 값이 없습니다.");

            return result;
        }

        String plate = request.getPlate();

        // 최신 번호 저장
        latestPlate = plate;

        // DB 조회
        Optional<Cust> customer =
                custRepository.findByCarNum(plate);

        result.put("plate", plate);

        // 기존 고객
        if (customer.isPresent()) {

            result.put("success", true);

            result.put("isNew", false);

            result.put(
                    "customerId",
                    customer.get().getCustNum()
            );

            result.put(
                    "message",
                    "기존 고객입니다."
            );
        }

        // 신규 고객
        else {

            // 자동 저장
            Cust newCustomer = new Cust();

            newCustomer.setCarNum(plate);

            custRepository.save(newCustomer);

            result.put("success", true);

            result.put("isNew", true);

            result.put(
                    "customerId",
                    newCustomer.getCustNum()
            );

            result.put(
                    "message",
                    "신규 고객 저장 완료"
            );
        }

        return result;
    }
}