import axios from "../axiosClient";

const CartService = {
    getCart: () => {
        return axios.get("/carts");
    },

    addProduct: (productId, quantity) => {
        return axios.post("/carts/items", { productId, quantity });
    },

    updateQuantity: (productId, quantity) => {
        return axios.patch("/carts/items", { productId, quantity });
    },

    removeItems: (productId) => {
        return axios.delete("/carts/items", {
            data: [productId],
        });
    },
};

export default CartService;