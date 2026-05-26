import axios from "../axiosClient";

const CategoryService = {
    getAllCategories: async () => {
        try {
            const response = await axios.get('/categories');
            return response?.data;
        } catch (error) {
            throw error.response?.data?.message || 'Lấy danh sách danh mục thất bại. Vui lòng thử lại!';
        }
    },

    getCategoryById: async (id) => {
        try {
            const response = await axios.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Lấy chi tiết danh mục thất bại!';
        }
    },

    createCategory: async (categoryData) => {
        try {
            const response = await axios.post('/categories', categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Thêm danh mục thất bại. Vui lòng thử lại!';
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const response = await axios.put(`/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Cập nhật danh mục thất bại. Vui lòng thử lại!';
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await axios.delete(`/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Xóa danh mục thất bại. Vui lòng thử lại!';
        }
    },
    getAllCategoriesByCategoryName: async (name) => {
        try {
            const response = await axios.get('/categories/by-name', {
                params: { name }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Lấy danh sách danh mục thất bại. Vui lòng thử lại!';
        }
    },

    searchCategories: async (keyword = '', page = 0, size = 10) => {
        try {
            const response = await axios.get('/categories/search', {
                params: {
                    keyword,
                    page,
                    size
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Tìm kiếm danh mục thất bại!';
        }
    },

    updateCategoryStatus: async (id) => {
        try {
            const response = await axios.patch(`/api/categories/${id}/status`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Cập nhật trạng thái danh mục thất bại!';
        }
    }
};

export default CategoryService;