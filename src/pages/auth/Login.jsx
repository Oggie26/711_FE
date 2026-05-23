import React, { useState } from 'react';
import {
  Form,
  Input,
 Button,
  Checkbox,
  message,
} from 'antd';

import {
  Mail,
  Lock,
  Store,
  User,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import '../../styles/Login.scss';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const navigate = useNavigate();

  const onFinish = (values) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (isRegister) {
        message.success('Tạo tài khoản thành công!');
      } else {
        message.success('Đăng nhập thành công!');
      }

      navigate('/admin');
    }, 1200);
  };

  return (
    <div className="auth-container">

      {/* BÊN TRÁI */}
      <div className="auth-left">

        <img
          src="https://i.pinimg.com/736x/5d/db/e9/5ddbe9549cf52c8db323da16eb4bf3da.jpg"
          alt="7-Eleven"
          className="auth-image"
        />

        <div className="auth-overlay"></div>

        <div className="auth-left-content">

          <div>
            <div className="brand-box">
              <Store className="brand-icon" />
            </div>

            <h1>7-Eleven</h1>

            <p>Hệ thống quản lý cửa hàng thông minh</p>
          </div>

          <div className="auth-left-bottom">

            <h2>
              Nền tảng quản lý <br />
              cửa hàng hiện đại
            </h2>

          </div>

        </div>
      </div>

      {/* BÊN PHẢI */}
      <div className="auth-right">

        <div className="auth-form-wrapper">

          <div className="auth-header">

            <div className="logo-circle">
              <Store className="logo-icon" />
            </div>

            <h2>
              {isRegister
                ? 'Tạo tài khoản'
                : 'Chào mừng trở lại'}
            </h2>

            <p>
              {isRegister
                ? 'Đăng ký để tiếp tục'
                : 'Đăng nhập vào hệ thống'}
            </p>

          </div>

          <Form
            layout="vertical"
            onFinish={onFinish}
            size="large"
            initialValues={{ remember: true }}
          >

            {isRegister && (
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message:
                      'Vui lòng nhập tên người dùng!',
                  },
                ]}
              >
                <Input
                  prefix={
                    <User className="input-icon" />
                  }
                  placeholder="Tên người dùng"
                  className="glass-input"
                />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message:
                    'Vui lòng nhập email!',
                },
                {
                  type: 'email',
                  message:
                    'Email không hợp lệ!',
                },
              ]}
            >
              <Input
                prefix={
                  <Mail className="input-icon" />
                }
                placeholder="admin@7eleven.com"
                className="glass-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message:
                    'Vui lòng nhập mật khẩu!',
                },
              ]}
            >
              <Input.Password
                prefix={
                  <Lock className="input-icon" />
                }
                placeholder="••••••••"
                className="glass-input"
              />
            </Form.Item>

            {isRegister && (
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  {
                    required: true,
                    message:
                      'Vui lòng xác nhận mật khẩu!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (
                        !value ||
                        getFieldValue('password') === value
                      ) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error(
                          'Mật khẩu xác nhận không khớp!'
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={
                    <Lock className="input-icon" />
                  }
                  placeholder="Xác nhận mật khẩu"
                  className="glass-input"
                />
              </Form.Item>
            )}

            {!isRegister && (
              <div className="auth-options">

                <Form.Item
                  name="remember"
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox className="remember-checkbox">
                    Ghi nhớ đăng nhập
                  </Checkbox>
                </Form.Item>

                <a
                  href="#"
                  className="forgot-link"
                >
                  Quên mật khẩu?
                </a>

              </div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="submit-btn"
              >
                {isRegister
                  ? 'Tạo tài khoản'
                  : 'Đăng nhập'}
              </Button>
            </Form.Item>

            <div className="switch-auth">

              <span>
                {isRegister
                  ? 'Đã có tài khoản?'
                  : 'Chưa có tài khoản?'}
              </span>

              <button
                type="button"
                onClick={() =>
                  setIsRegister(!isRegister)
                }
                className="switch-btn"
              >
                {isRegister
                  ? 'Đăng nhập'
                  : 'Đăng ký'}
              </button>

            </div>

          </Form>

        </div>

      </div>

    </div>
  );
};

export default AuthPage;