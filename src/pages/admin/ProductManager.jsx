import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, InputNumber, Select, message } from 'antd';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const { Option } = Select;

const initialProducts = [
  { id: 1, name: 'Slurpee Cherry', price: 2.99, category: 'Drinks', stock: 50, status: 'Active' },
  { id: 2, name: 'Big Bite Hot Dog', price: 3.49, category: 'Food', stock: 20, status: 'Active' },
  { id: 3, name: '7-Select Chips', price: 1.99, category: 'Snacks', stock: 0, status: 'Out of Stock' },
];

const ProductManager = () => {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-semibold text-white">{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <span className="text-gray-300">{cat}</span>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="text-orange font-bold">${price.toFixed(2)}</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => <span className="font-medium text-white">{stock}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        const isActive = status === 'Active';
        const bg = isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
        const border = isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        const text = isActive ? '#34d399' : '#f87171';
        return (
          <span 
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border tracking-wider"
            style={{ backgroundColor: bg, borderColor: border, color: text }}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<Edit2 className="w-4 h-4 text-emerald-400" />} 
            className="hover:bg-white/10 flex items-center justify-center rounded-lg"
          />
          <Button 
            type="text" 
            danger 
            icon={<Trash2 className="w-4 h-4 text-red-400" />} 
            onClick={() => handleDelete(record.id)}
            className="hover:bg-red-500/10 flex items-center justify-center rounded-lg"
          />
        </Space>
      ),
    },
  ];

  const handleDelete = (id) => {
    Modal.confirm({
      title: <span className="text-white font-bold">Delete Product</span>,
      content: <span className="text-gray-300">Are you sure you want to delete this product? This action cannot be undone.</span>,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      okButtonProps: { className: 'bg-red-500 hover:bg-red-600 border-none' },
      cancelButtonProps: { className: 'bg-white/10 border-white/20 text-white hover:text-white' },
      onOk() {
        setProducts(products.filter(p => p.id !== id));
        message.success({ content: 'Product deleted successfully', style: { marginTop: '8vh' } });
      },
    });
  };

  const handleCreate = (values) => {
    const newProduct = {
      id: Date.now(),
      ...values,
      status: values.stock > 0 ? 'Active' : 'Out of Stock'
    };
    setProducts([...products, newProduct]);
    setIsModalOpen(false);
    form.resetFields();
    message.success({ content: 'Product created successfully', style: { marginTop: '8vh' } });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white m-0 tracking-wide">Products</h1>
          <p className="text-gray-400 m-0 mt-1">Manage your store inventory</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus className="w-4 h-4" />} 
          className="bg-gradient-to-r from-[#008061] to-[#00a37c] hover:shadow-[#008061]/20 shadow-lg border-none flex items-center h-10 px-5 rounded-lg text-white font-semibold transition-all hover:scale-[1.02]"
          onClick={() => setIsModalOpen(true)}
        >
          Add Product
        </Button>
      </div>

      <div className="mb-6 max-w-md">
        <Input 
          size="large" 
          placeholder="Search products..." 
          prefix={<Search className="text-gray-400 w-4 h-4" />} 
          className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 focus:bg-white/10 focus:border-white/20"
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
        className="glass-table border-none"
      />

      <Modal
        title={<span className="text-white font-bold">Create New Product</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        wrapClassName="glass-modal-wrapper"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-6">
          <Form.Item 
            name="name" 
            label={<span className="text-gray-300">Product Name</span>} 
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. Slurpee Cola" className="bg-white/5 border-white/10 text-white" />
          </Form.Item>
          
          <div className="flex gap-4">
            <Form.Item 
              name="price" 
              label={<span className="text-gray-300">Price ($)</span>} 
              rules={[{ required: true }]} 
              className="flex-1"
            >
              <InputNumber min={0} step={0.01} className="w-full bg-white/5 border-white/10 text-white" placeholder="2.99" />
            </Form.Item>
            
            <Form.Item 
              name="stock" 
              label={<span className="text-gray-300">Initial Stock</span>} 
              rules={[{ required: true }]} 
              className="flex-1"
            >
              <InputNumber min={0} className="w-full bg-white/5 border-white/10 text-white" placeholder="50" />
            </Form.Item>
          </div>

          <Form.Item 
            name="category" 
            label={<span className="text-gray-300">Category</span>} 
            rules={[{ required: true }]}
          >
            <Select placeholder="Select a category" dropdownClassName="ant-select-dropdown bg-slate-900 border-white/10">
              <Option value="Drinks">Drinks</Option>
              <Option value="Food">Food</Option>
              <Option value="Snacks">Snacks</Option>
              <Option value="Bakery">Bakery</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8">
            <Button 
              onClick={() => setIsModalOpen(false)}
              className="bg-white/5 hover:bg-white/15 border-white/12 text-white hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="bg-gradient-to-r from-[#008061] to-[#00a37c] border-none font-semibold"
            >
              Create Product
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManager;
