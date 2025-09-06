package com.listasColab.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "list_items")
public class ListItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer quantity;
    private Boolean purchased;

    @ManyToOne
    @JoinColumn(name = "list_id")
    private ShoppingList shoppingList;

    // Constructores, getters y setters
    public ListItem() {
        this.purchased = false;
    }

    public ListItem(String name, Integer quantity, ShoppingList shoppingList) {
        this.name = name;
        this.quantity = quantity;
        this.shoppingList = shoppingList;
        this.purchased = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Boolean getPurchased() {
        return purchased;
    }

    public void setPurchased(Boolean purchased) {
        this.purchased = purchased;
    }

    public ShoppingList getShoppingList() {
        return shoppingList;
    }

    public void setShoppingList(ShoppingList shoppingList) {
        this.shoppingList = shoppingList;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((name == null) ? 0 : name.hashCode());
        result = prime * result + ((quantity == null) ? 0 : quantity.hashCode());
        result = prime * result + ((purchased == null) ? 0 : purchased.hashCode());
        result = prime * result + ((shoppingList == null) ? 0 : shoppingList.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        ListItem other = (ListItem) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        if (name == null) {
            if (other.name != null)
                return false;
        } else if (!name.equals(other.name))
            return false;
        if (quantity == null) {
            if (other.quantity != null)
                return false;
        } else if (!quantity.equals(other.quantity))
            return false;
        if (purchased == null) {
            if (other.purchased != null)
                return false;
        } else if (!purchased.equals(other.purchased))
            return false;
        if (shoppingList == null) {
            if (other.shoppingList != null)
                return false;
        } else if (!shoppingList.equals(other.shoppingList))
            return false;
        return true;
    }

}