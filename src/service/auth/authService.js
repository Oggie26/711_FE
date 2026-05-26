import axios from "../axiosClient";

const AuthService = {
    login: async (email, password) => {
        try {
            const response = await axios.post('/auth/login', {
                email,
                password
            });
            if (response.data && response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
            }

            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin!';
        }
    },

    register: async (registerData) => {
        try {
            const response = await axios.post('/auth/register', registerData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
        }
    },

    logout: () => {
        localStorage.removeItem('token');
    }
};

export default AuthService;