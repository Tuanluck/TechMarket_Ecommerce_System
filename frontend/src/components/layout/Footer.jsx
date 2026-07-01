import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const commitments = [
    { icon: '🚚', title: 'Miễn phí giao hàng', desc: 'Cho tất cả đơn hàng từ 500k' },
    { icon: '🔒', title: 'Thanh toán bảo mật', desc: 'Mã hóa SSL an toàn tuyệt đối' },
    { icon: '↩️', title: 'Đổi trả dễ dàng', desc: 'Đổi mới 30 ngày nếu lỗi sản xuất' },
    { icon: '📞', title: 'CSKH 24/7', desc: 'Tư vấn kỹ thuật tận tâm hỗ trợ' }
  ];

  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      {/* Commitments Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 border-b border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {commitments.map((c, idx) => (
            <div key={idx} className="flex items-center gap-3.5 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
              <span className="text-2xl select-none">{c.icon}</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-800">{c.title}</h4>
                <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mt-0.5">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Info & Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-lg font-black text-indigo-600 tracking-tight">
              TechMarket
            </Link>
            <p className="text-xs text-gray-400 font-semibold leading-relaxed">
              Trang mua sắm thiết bị công nghệ hàng đầu, mang đến các sản phẩm chính hãng với dịch vụ tốt nhất.
            </p>
            <div className="flex gap-3 text-sm pt-2">
              <span className="cursor-pointer hover:text-indigo-600 transition-colors">🌐 VN</span>
              <span className="text-gray-300">|</span>
              <span className="cursor-pointer hover:text-indigo-600 transition-colors">🇬🇧 EN</span>
            </div>
          </div>

          {/* Column 2: Categories quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Danh mục sản phẩm</h4>
            <ul className="space-y-2 text-xs font-bold text-gray-600">
              <li>
                <Link to="/?category=dien-thoai" className="hover:text-indigo-600 transition-colors">
                  Điện thoại thông minh
                </Link>
              </li>
              <li>
                <Link to="/?category=laptop" className="hover:text-indigo-600 transition-colors">
                  Máy tính xách tay
                </Link>
              </li>
              <li>
                <Link to="/?category=chuot-ban-phim" className="hover:text-indigo-600 transition-colors">
                  Chuột & Bàn phím
                </Link>
              </li>
              <li>
                <Link to="/?category=tai-nghe" className="hover:text-indigo-600 transition-colors">
                  Tai nghe âm thanh
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-xs font-bold text-gray-600">
              <li>
                <Link to="/contact" className="hover:text-indigo-600 transition-colors">
                  Liên hệ chúng tôi
                </Link>
              </li>
              <li>
                <span className="cursor-pointer hover:text-indigo-600 transition-colors">Chính sách đổi trả</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-indigo-600 transition-colors">Chính sách bảo hành</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-indigo-600 transition-colors">Điều khoản dịch vụ</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin liên hệ</h4>
            <p className="text-xs font-bold text-gray-600">
              📍 123 Đường Cầu Giấy, Hà Nội
            </p>
            <p className="text-xs font-bold text-gray-600">
              📞 Hotline: 1900 1234
            </p>
            <p className="text-xs font-bold text-gray-600">
              ✉️ Email: support@techmarket.vn
            </p>
            {/* Accepted payment logos */}
            <div className="flex gap-2 pt-2 items-center opacity-65">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mr-1 select-none">Thanh toán:</span>
              <span className="px-2 py-0.5 border border-gray-100 bg-gray-50 font-black font-mono text-[9px] rounded text-indigo-600">VNPay</span>
              <span className="px-2 py-0.5 border border-gray-100 bg-gray-50 font-black font-mono text-[9px] rounded text-red-500">MOMO</span>
              <span className="px-2 py-0.5 border border-gray-100 bg-gray-50 font-black font-mono text-[9px] rounded text-gray-600">COD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright row */}
      <div className="bg-gray-50 border-t border-gray-100 py-6 text-center text-xs font-semibold text-gray-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>&copy; {currentYear} TechMarket. Tất cả quyền được bảo lưu.</p>
          <p className="text-[11px] text-gray-300">Thiết kế bởi Senior Frontend Team</p>
        </div>
      </div>
    </footer>
  );
}
