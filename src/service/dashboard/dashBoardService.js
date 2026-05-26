import axiosClient from "../axiosClient";

const DashboardService = {
    getDashboardStats: () => {
        return axiosClient.get("/dashboard/stats");
    },
    getWeeklySales: () => {
        return axiosClient.get("/dashboard/weekly-sales");
    },
    getTotalUsers: () => {
        return axiosClient.get("/dashboard/total-users");
    },
    getMonthlySales: () => {
        return axiosClient.get("/dashboard/monthly-sales");
    }
};

export default DashboardService;