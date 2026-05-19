package DT_DB.test;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustRepository extends JpaRepository<Cust, Integer> {

    Cust findByCarNum(String carNum);

}