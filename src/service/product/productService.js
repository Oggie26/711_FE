import axios from "../axiosClient";

const ProductService = {
    getAllProducts: async () => {
        try {
            const response = await axios.get('/products');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Lấy danh sách sản phẩm thất bại!';
        }
    },

    searchProducts: async (keyword = '', page = 0, size = 10) => {
        try {
            const response = await axios.get('/products/search', {
                params: { keyword, page, size }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Tìm kiếm sản phẩm thất bại!';
        }
    },

    getProductById: async (id) => {
        try {
            const response = await axios.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Lấy chi tiết sản phẩm thất bại!';
        }
    },

    getProductBySlug: async (slug) => {
        try {
            const response = await axios.get(`/products/slug/${slug}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Không tìm thấy sản phẩm theo đường dẫn này!';
        }
    },

    getProductsByCategory: async (categoryId, page = 0, size = 10) => {
        try {
            const response = await axios.get(`/products/category/${categoryId}`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Lấy sản phẩm theo danh mục thất bại!';
        }
    },

    createProduct: async (productData) => {
        try {
            const response = await axios.post('/products', productData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Thêm sản phẩm mới thất bại. Vui lòng thử lại!';
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const response = await axios.put(`/products/${id}`, productData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Cập nhật sản phẩm thất bại. Vui lòng thử lại!';
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await axios.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Xóa sản phẩm thất bại!';
        }
    },

    toggleProductStatus: async (id) => {
        try {
            const response = await axios.patch(`/products/${id}/status`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Cập nhật trạng thái sản phẩm thất bại!';
        }
    }
};

export default ProductService;