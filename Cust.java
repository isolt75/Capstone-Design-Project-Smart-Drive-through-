package DT_DB.test;

import jakarta.persistence.*;

@Entity
@Table(name = "DT_TB_CUST")
public class Cust {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CUST_NUM")
    private int custNum;

    @Column(name = "CAR_NUM")
    private String carNum;

    // 기본 생성자
    public Cust() {
    }

    // 생성자
    public Cust(int custNum, String carNum) {
        this.custNum = custNum;
        this.carNum = carNum;
    }

    // =========================
    // Getter / Setter
    // =========================

    public int getCustNum() {
        return custNum;
    }

    public void setCustNum(int custNum) {
        this.custNum = custNum;
    }

    public String getCarNum() {
        return carNum;
    }

    public void setCarNum(String carNum) {
        this.carNum = carNum;
    }
}