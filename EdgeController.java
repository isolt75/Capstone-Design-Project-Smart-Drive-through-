package DT_DB.test.controller;

import DT_DB.test.Cust;
import DT_DB.test.repository.CustRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")

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

public class EdgeController {

    private final CustRepository custRepo;

    public EdgeController(CustRepository custRepo) {
        this.custRepo = custRepo;
    }

    // ========================================
    // 1. 차량 번호판 OCR 수신
    // ========================================

    @PostMapping("/drivethrough/vehicle-entry")
    public ResponseEntity<?> vehicleEntry(

            @RequestParam("event_id")
            String eventId,

            @RequestParam("device_id")
            String deviceId,

            @RequestParam("captured_at")
            String capturedAt,

            @RequestParam("distance_cm")
            String distanceCm,

            @RequestParam(
                    value = "plates_meta",
                    required = false
            )
            String platesMeta,

            @RequestParam Map<String, MultipartFile> files,

            @RequestParam(
                    value = "plate_number",
                    required = false
            )
            String plateNumber
    ) {

        try {

            System.out.println("===== OCR 차량 진입 =====");

            System.out.println("eventId = " + eventId);
            System.out.println("deviceId = " + deviceId);
            System.out.println("capturedAt = " + capturedAt);
            System.out.println("distanceCm = " + distanceCm);

            System.out.println("platesMeta = " + platesMeta);

            System.out.println("plateNumber = " + plateNumber);

            // 업로드 파일 확인
            for (String key : files.keySet()) {

                MultipartFile file = files.get(key);

                System.out.println(
                        "file = "
                                + file.getOriginalFilename()
                );
            }

            // OCR 결과 없을 경우
            if (plateNumber == null ||
                    plateNumber.isBlank()) {

                plateNumber = "UNKNOWN";
            }

            // 고객 조회
            Optional<Cust> optionalCust =
                    custRepo.findByCarNum(
                            plateNumber
                    );

            Cust cust;

            // 신규 고객 저장
            if (optionalCust.isEmpty()) {

                cust = new Cust();

                cust.setCarNum(
                        plateNumber
                );

                custRepo.save(cust);

            } else {

                cust = optionalCust.get();
            }

            Map<String, Object> result =
                    new HashMap<>();

            result.put("status", "ok");

            result.put(
                    "plate",
                    plateNumber
            );

            result.put(
                    "customerId",
                    cust.getCustNum()
            );

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "status", "error",
                            "message", e.getMessage()
                    ));
        }
    }

    // ========================================
    // 2. 음성 주문(STT)
    // ========================================

    @PostMapping("/drivethrough/voice-order")
    public ResponseEntity<?> voiceOrder(

            @RequestParam("event_id")
            String eventId,

            @RequestParam("device_id")
            String deviceId,

            @RequestParam("recorded_at")
            String recordedAt,

            @RequestParam("duration_ms")
            int durationMs,

            @RequestParam("sample_rate")
            int sampleRate,

            @RequestParam("text")
            String text
    ) {

        try {

            System.out.println(
                    "===== 음성 주문 ====="
            );

            System.out.println(
                    "eventId = " + eventId
            );

            System.out.println(
                    "deviceId = " + deviceId
            );

            System.out.println(
                    "text = " + text
            );

            // TODO:
            // GPT / 메뉴 분석 / 주문 연결

            return ResponseEntity.ok(
                    Map.of(
                            "status", "ok"
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "status", "error",
                            "message", e.getMessage()
                    ));
        }
    }

    // ========================================
    // 3. Edge 상태 체크
    // ========================================

    @PostMapping("/edge/heartbeat")
    public ResponseEntity<?> heartbeat(

            @RequestBody
            Map<String, Object> body
    ) {

        try {

            System.out.println(
                    "===== HEARTBEAT ====="
            );

            System.out.println(body);

            return ResponseEntity.ok(
                    Map.of(
                            "status", "ok"
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "status", "error",
                            "message", e.getMessage()
                    ));
        }
    }
}