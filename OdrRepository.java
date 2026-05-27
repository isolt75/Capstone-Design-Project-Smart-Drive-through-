package DT_DB.test;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OdrRepository
        extends JpaRepository<Odr, Integer> {

    long countByOdrTimeBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    List<Odr> findAllByOrderByOdrTimeDesc();
}