import axios from "../axiosClient";

const OrderService = {
  createOrder: (cartId, paymentMethod) => {
    return axios.post(`/orders?cartId=${cartId}&paymentMethod=${paymentMethod}`);
  },

  getMyOrders: () => {
    return axios.get("/orders/my-orders");
  },

  getAllOrders: () => {
    return axios.get("/orders/all");
  },

  searchOrders: (keyword = "", page = 0, size = 10) => {
    return axios.get(`/orders?keyword=${keyword}&page=${page}&size=${size}`);
  },

  getOrderById: (id) => {
    return axios.get(`/orders/${id}`);
  },

  checkOutOrder: (id) => {
    return axios.patch(`/orders/${id}/checkout`);
  },

  deleteOrder: (id) => {
    return axios.delete(`/orders/${id}`);
  }
};

export default OrderService;