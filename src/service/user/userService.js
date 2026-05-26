import axios from "../axiosClient";

const UserService = {
    profile: async () => {
        try {
            const response = await axios.get('/users/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Lấy thông tin thất bại!';
        }
    },

    getUserById: async (id) => {
        try {
            const response = await axios.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Không tìm thấy user!';
        }
    },

    getAllUsers: async () => {
        try {
            const response = await axios.get('/users');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Lấy danh sách thất bại!';
        }
    },

    searchUser: async (keyword = "", page = 0, size = 10) => {
        try {
            const response = await axios.get('/users/search', {
                params: {
                    keyword,
                    page,
                    size
                }
            });
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Tìm kiếm thất bại!';
        }
    }
};

export default UserService;