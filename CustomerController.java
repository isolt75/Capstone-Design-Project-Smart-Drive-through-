package DT_DB.test.controller;
import DT_DB.test.repository.CustRepository;
import DT_DB.test.Cust;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/customer")
@CrossOrigin(origins = "*")

public class CustomerController {

    private final CustRepository custRepo;

    public CustomerController(
            CustRepository custRepo
    ) {
        this.custRepo = custRepo;
    }

    @GetMapping
    public Object getCustomer(
            @RequestParam String plate
    ) {

        Optional<Cust> customer =
                custRepo.findByCarNum(plate);

        Map<String, Object> result =
                new HashMap<>();

        // 신규 고객
        if (customer.isEmpty()) {

            result.put("isNew", true);

            result.put(
                    "message",
                    "신규 고객입니다."
            );

            return result;
        }

        // 기존 고객
        Cust cust = customer.get();

        result.put("isNew", false);

        result.put(
                "customerId",
                cust.getCustNum()
        );

        result.put(
                "plate",
                cust.getCarNum()
        );

        result.put(
                "message",
                "기존 고객입니다."
        );

        return result;
    }
}