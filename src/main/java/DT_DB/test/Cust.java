package DT_DB.test;

import jakarta.persistence.*;

@Entity
@Table(name = "DT_TB_CUST")
public class Cust {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CUST_NUM")
    private int custNum;

    @Column(name = "CUST_NM")
    private String custNm;

    @Column(name = "CAR_NUM")
    private String carNum;

    public Cust() {
    }

    public Cust(int custNum, String custNm, String carNum) {
        this.custNum = custNum;
        this.custNm = custNm;
        this.carNum = carNum;
    }

    public int getCustNum() {
        return custNum;
    }

    public void setCustNum(int custNum) {
        this.custNum = custNum;
    }

    public String getCustNm() {
        return custNm;
    }

    public void setCustNm(String custNm) {
        this.custNm = custNm;
    }

    public String getCarNum() {
        return carNum;
    }

    public void setCarNum(String carNum) {
        this.carNum = carNum;
    }
}