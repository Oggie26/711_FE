import React, { useState } from 'react';
import { Table, Input, Button, Drawer, Divider, Space } from 'antd';
import { Search, Eye } from 'lucide-react';

const mockOrders = [
  { id: '#ORD-711-2026-X8F9', customer: 'John Doe', date: '2026-05-23 08:30', total: 12.50, status: 'Completed', items: 3 },
  { id: '#ORD-711-2026-B2V1', customer: 'Jane Smith', date: '2026-05-23 09:15', total: 4.98, status: 'Processing', items: 2 },
  { id: '#ORD-711-2026-M4N8', customer: 'Alex Johnson', date: '2026-05-23 09:45', total: 24.99, status: 'Pending', items: 5 },
];

const OrderManager = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="font-semibold text-emerald-400">{text}</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (name) => <span className="text-gray-200">{name}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => <span className="text-gray-300">{date}</span>,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <span className="font-bold text-white">${total.toFixed(2)}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        let bg = 'rgba(56, 189, 248, 0.15)'; // Processing (blue)
        let border = 'rgba(56, 189, 248, 0.3)';
        let text = '#38bdf8';
        
        if (status === 'Completed') {
          bg = 'rgba(16, 185, 129, 0.15)';
          border = 'rgba(16, 185, 129, 0.3)';
          text = '#34d399';
        } else if (status === 'Pending') {
          bg = 'rgba(245, 158, 11, 0.15)';
          border = 'rgba(245, 158, 11, 0.3)';
          text = '#fbbf24';
        }
        
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
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<Eye className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />} 
          onClick={() => {
            setSelectedOrder(record);
            setDrawerOpen(true);
          }}
          className="hover:bg-white/10 flex items-center justify-center rounded-lg group"
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white m-0 tracking-wide">Orders</h1>
        <p className="text-gray-400 m-0 mt-1">View and manage customer orders</p>
      </div>

      <div className="mb-6 max-w-md">
        <Input 
          size="large" 
          placeholder="Search by Order ID or Customer..." 
          prefix={<Search className="text-gray-400 w-4 h-4" />} 
          className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 focus:bg-white/10 focus:border-white/20"
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={mockOrders} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
        className="glass-table border-none"
      />

      <Drawer
        title={<span className="font-bold text-lg text-white">Order Details</span>}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={500}
        dropdownClassName="ant-select-dropdown"
      >
        {selectedOrder && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-emerald-400 m-0">{selectedOrder.id}</h2>
              {(() => {
                let bg = 'rgba(56, 189, 248, 0.15)';
                let border = 'rgba(56, 189, 248, 0.3)';
                let text = '#38bdf8';
                if (selectedOrder.status === 'Completed') {
                  bg = 'rgba(16, 185, 129, 0.15)';
                  border = 'rgba(16, 185, 129, 0.3)';
                  text = '#34d399';
                } else if (selectedOrder.status === 'Pending') {
                  bg = 'rgba(245, 158, 11, 0.15)';
                  border = 'rgba(245, 158, 11, 0.3)';
                  text = '#fbbf24';
                }
                return (
                  <span 
                    className="px-3 py-1 rounded-lg text-sm font-semibold border tracking-wider"
                    style={{ backgroundColor: bg, borderColor: border, color: text }}
                  >
                    {selectedOrder.status}
                  </span>
                );
              })()}
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-xl mb-6">
              <p className="text-gray-400 mb-1 text-sm font-medium">Customer Name</p>
              <p className="font-bold text-white mb-4 text-base">{selectedOrder.customer}</p>
              
              <p className="text-gray-400 mb-1 text-sm font-medium">Order Date</p>
              <p className="font-bold text-white m-0 text-base">{selectedOrder.date}</p>
            </div>

            <h3 className="font-bold text-white mb-4 text-base">Items ({selectedOrder.items})</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">Slurpee Cherry x 1</span>
                <span className="font-semibold text-white">$2.99</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">Big Bite Hot Dog x 2</span>
                <span className="font-semibold text-white">$6.98</span>
              </div>
            </div>

            <Divider className="border-white/10 my-6" />

            <div className="flex justify-between items-center text-lg px-2">
              <span className="font-bold text-white">Total</span>
              <span className="font-extrabold text-orange text-xl">${selectedOrder.total.toFixed(2)}</span>
            </div>

            <div className="mt-8 flex gap-4">
              <Button 
                type="primary" 
                className="flex-1 bg-gradient-to-r from-[#008061] to-[#00a37c] border-none font-semibold h-11"
              >
                Mark as Completed
              </Button>
              <Button 
                danger 
                className="flex-1 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 h-11"
              >
                Cancel Order
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default OrderManager;
