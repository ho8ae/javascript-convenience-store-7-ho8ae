class Product {
    #name;
    #price;
    #quantity;
    #promotion;

    constructor(name, price, quantity, promotion) {
        this.#name = name;
        this.#price = Number(price);
        this.#quantity = Number(quantity);
        this.#promotion = promotion;
    }
}

export default Product;