package DT_DB.test;

import jakarta.persistence.*;

@Entity
@Table(name = "DT_TB_MENU")

public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "MENU_NUM")
    private int menuNum;

    @Column(name = "MENU_NM")
    private String menuNm;

    @Column(name = "MENU_PRICE")
    private int menuPrice;

    @Column(name = "MENU_CATEGORY")
    private String menuCategory;

    @Column(name = "CAF_YN")
    private String cafYn;

    // getter/setter

    public int getMenuNum() {
        return menuNum;
    }

    public void setMenuNum(int menuNum) {
        this.menuNum = menuNum;
    }

    public String getMenuNm() {
        return menuNm;
    }

    public void setMenuNm(String menuNm) {
        this.menuNm = menuNm;
    }

    public int getMenuPrice() {
        return menuPrice;
    }

    public void setMenuPrice(int menuPrice) {
        this.menuPrice = menuPrice;
    }

    public String getMenuCategory() {
        return menuCategory;
    }

    public void setMenuCategory(String menuCategory) {
        this.menuCategory = menuCategory;
    }

    public String getCafYn() {
        return cafYn;
    }

    public void setCafYn(String cafYn) {
        this.cafYn = cafYn;
    }
}