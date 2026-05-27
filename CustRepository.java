package DT_DB.test.repository;

import DT_DB.test.Cust;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustRepository
        extends JpaRepository<Cust, Long> {

    Optional<Cust> findByCarNum(String carNum);
    Optional<Cust> findTopByOrderByCustNumDesc();
}