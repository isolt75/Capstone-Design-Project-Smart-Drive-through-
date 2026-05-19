package DT_DB.test;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dt_tb_odr")
public class Odr {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "odr_num")
    private int odrNum;

    @Column(name = "odr_nm", nullable = false)
    private String odrNm;

    @Column(name = "cust_num")
    private int custNum;

    @Column(name = "odr_time")
    private LocalDateTime odrTime;

    @Column(name = "menu_num")
    private int menuNum;

    @Column(name = "menu_cnt")
    private int menuCnt;

    // 기본 생성자
    public Odr() {}

    // 🔥 최종 생성자
    public Odr(String odrNm, int custNum, LocalDateTime odrTime, int menuNum, int menuCnt) {
        this.odrNm = odrNm;
        this.custNum = custNum;
        this.odrTime = odrTime;
        this.menuNum = menuNum;
        this.menuCnt = menuCnt;
    }

    // getter/setter 생략 가능 (롬복 쓰면 @Getter @Setter)
}