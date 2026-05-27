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

    // 메뉴명 저장
    @Column(name = "odr_nm", nullable = false)
    private String odrNm;

    // 고객번호
    @Column(name = "cust_num")
    private int custNum;

    // 주문시간
    @Column(name = "odr_time")
    private LocalDateTime odrTime;

    // 메뉴번호
    @Column(name = "menu_num")
    private int menuNum;

    // 수량
    @Column(name = "menu_cnt")
    private int menuCnt;

    // 주문번호 (001, 002 ...)
    @Column(name = "order_number")
    private String orderNumber;

    // 기본 생성자
    public Odr() {}

    // 최종 생성자
    public Odr(
            String odrNm,
            int custNum,
            LocalDateTime odrTime,
            int menuNum,
            int menuCnt,
            String orderNumber
    ) {
        this.odrNm = odrNm;
        this.custNum = custNum;
        this.odrTime = odrTime;
        this.menuNum = menuNum;
        this.menuCnt = menuCnt;
        this.orderNumber = orderNumber;
    }

    // =========================
    // Getter / Setter
    // =========================

    public int getOdrNum() {
        return odrNum;
    }

    public void setOdrNum(int odrNum) {
        this.odrNum = odrNum;
    }

    public String getOdrNm() {
        return odrNm;
    }

    public void setOdrNm(String odrNm) {
        this.odrNm = odrNm;
    }

    public int getCustNum() {
        return custNum;
    }

    public void setCustNum(int custNum) {
        this.custNum = custNum;
    }

    public LocalDateTime getOdrTime() {
        return odrTime;
    }

    public void setOdrTime(LocalDateTime odrTime) {
        this.odrTime = odrTime;
    }

    public int getMenuNum() {
        return menuNum;
    }

    public void setMenuNum(int menuNum) {
        this.menuNum = menuNum;
    }

    public int getMenuCnt() {
        return menuCnt;
    }

    public void setMenuCnt(int menuCnt) {
        this.menuCnt = menuCnt;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
}