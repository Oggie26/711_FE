import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Phone, Calendar, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import AuthService from '../../service/auth/authService';
import { jwtDecode } from "jwt-decode";

const AuthPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    birthday: '',
    gender: true // Mặc định là Nam (true)
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsRegister(prev => !prev);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      birthday: '',
      gender: true
    });
  };

  const onFinish = async (e) => {
    e.preventDefault();

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp!');
        return;
      }

      setLoading(true);
      try {
        const payload = {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          birthday: formData.birthday || null,
          gender: formData.gender,
          point: 0
        };

        await AuthService.register(payload);

        toast.success('Đăng ký tài khoản thành công! 🎉');
        setIsRegister(false);
        setFormData({ email: '', password: '', confirmPassword: '', fullName: '', phone: '', birthday: '', gender: true });
      } catch (error) {
        toast.error(error?.message || 'Đăng ký thất bại, thử lại sau!');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        await AuthService.login(formData.email, formData.password);
        toast.success('Đăng nhập thành công! Chào mừng bạn.');
        const token = localStorage.getItem("accessToken");
        const user = jwtDecode(token);
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } catch (error) {
        toast.error(error?.message || 'Tài khoản hoặc mật khẩu không đúng');
      } finally {
        setLoading(false);
      }
    }
  };

  const inputTailwindClass = "w-full bg-slate-50 text-slate-900 font-semibold placeholder-gray-400 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/20 focus:border-[#008061] transition-all text-sm";

  return (
    <div className="flex min-h-screen bg-white relative font-sans">

      <Toaster position="top-right" reverseOrder={false} />

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-600 hover:text-[#008061] bg-white shadow-md border border-gray-100 px-4 py-2 rounded-full transition-all text-sm font-bold active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" /> Trang chủ
      </button>

      <div className="hidden lg:flex w-1/2 relative bg-[#008061] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1601599561096-f87c95fff1e9?q=80&w=1200"
          className="absolute inset-0 w-full h-full object-cover"
          alt="auth"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#008061]/95 via-[#008061]/70 to-black/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-16 text-white z-10 pb-20">
          <h2 className="text-4xl lg:text-5xl font-black leading-tight drop-shadow-lg mb-6 max-w-sm">
            Nền tảng mua sắm <br />
            <span className="text-[#ffcb05]">trực tuyến nhanh chóng</span>
          </h2>
          <div className="text-3xl font-black text-white tracking-tighter leading-none flex items-center">
            <span className="text-4xl text-[#e4252b]">7</span>
            <span className="text-green-200">-ELEVEn</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#f9fafb]">
        <div className="w-full max-w-[440px] bg-white p-8 sm:p-10 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-gray-100 mt-12 lg:mt-0">

          <h2 className="text-3xl font-black text-center text-gray-900 mb-2">
            {isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại!'}
          </h2>

          <p className="text-center text-gray-500 font-semibold text-sm mb-6">
            {isRegister ? 'Điền thông tin để đăng ký thành viên' : 'Đăng nhập để bắt đầu mua sắm'}
          </p>

          <form onSubmit={onFinish} className="flex flex-col gap-4">

            {isRegister && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Họ và tên"
                  className={inputTailwindClass}
                  required
                  minLength="2"
                  maxLength="100"
                />
              </div>
            )}

            {isRegister && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Số điện thoại"
                  type="tel"
                  pattern="^(0|\+84)[0-9]{9,10}$"
                  className={inputTailwindClass}
                  required
                />
              </div>
            )}

            {isRegister && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className={inputTailwindClass}
                />
              </div>
            )}

            {isRegister && (
              <div className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 flex items-center justify-center gap-12 transition-all">
                <label className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform">
                  <input
                    type="radio"
                    name="gender"
                    value="true"
                    checked={formData.gender === true}
                    onChange={() => setFormData({ ...formData, gender: true })}
                    className="w-5 h-5 text-[#008061] bg-white border-gray-300 focus:ring-[#008061]/20 focus:ring-2 accent-[#008061]"
                  />
                  <span className="text-sm font-semibold text-slate-700">Nam</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform">
                  <input
                    type="radio"
                    name="gender"
                    value="false"
                    checked={formData.gender === false}
                    onChange={() => setFormData({ ...formData, gender: false })}
                    className="w-5 h-5 text-[#008061] bg-white border-gray-300 focus:ring-[#008061]/20 focus:ring-2 accent-[#008061]"
                  />
                  <span className="text-sm font-semibold text-slate-700">Nữ</span>
                </label>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email của bạn"
                type="email"
                className={inputTailwindClass}
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu (Tối thiểu 6 ký tự)"
                className="w-full bg-slate-50 text-slate-900 font-semibold placeholder-gray-400 border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/20 focus:border-[#008061] transition-all text-sm"
                required
                minLength="6"
                maxLength="50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 active:scale-90 transition-transform"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isRegister && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Xác nhận mật khẩu"
                  className={inputTailwindClass}
                  required
                />
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full text-white bg-[#008061] hover:bg-[#006c52] font-bold rounded-xl text-base px-5 py-3.5 flex justify-center items-center shadow-lg shadow-[#008061]/10 active:scale-[0.99] transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'
              )}
            </button>

          </form>

          <div className="text-center mt-6 flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500 font-medium">
              {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="text-[#008061] font-bold hover:text-[#006c52] bg-transparent border-none p-0 transition-colors active:scale-95"
            >
              {isRegister ? 'Đăng nhập ngay' : 'Đăng ký thành viên'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;