import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Ticket, Search, Copy, CheckCircle, Gift, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function VouchersPage() {
  const { isLoggedIn } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get('/vouchers');
        // Filter out deleted and inactive/draft vouchers
        const activeVouchers = (res.data.data?.vouchers || []).filter(
          (v) => v.status === 'active' && !v.isDeleted && (!v.expiryDate || new Date(v.expiryDate) > new Date())
        );
        setVouchers(activeVouchers);
      } catch (err) {
        console.error('Lỗi khi tải danh sách voucher:', err);
        setError('Có lỗi xảy ra khi tải danh sách mã giảm giá. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (v.name && v.name.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 top-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="max-w-xl space-y-4 relative z-10">
          <span className="inline-block text-xs font-black uppercase tracking-widest bg-yellow-400 text-indigo-900 px-3 py-1 rounded-full shadow-sm">
            Kho Coupon Siêu Hot
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Khuyến Mãi Ngập Tràn - Mua Sắm Thả Ga
          </h1>
          <p className="text-sm md:text-base text-indigo-100 font-medium">
            Thu thập ngay hàng ngàn mã giảm giá giá trị cao, mã miễn phí vận chuyển và ưu đãi thanh toán độc quyền dành riêng cho bạn.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Search header bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm mã giảm giá..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
          </div>
          <div className="text-xs text-gray-500 font-bold">
            Hiển thị {filteredVouchers.length} mã giảm giá khả dụng
          </div>
        </div>

        {/* Info message for guest users */}
        {!isLoggedIn && (
          <div className="bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3.5 rounded-2xl flex items-center gap-3 shadow-sm">
            <ShieldAlert size={20} className="text-amber-600 flex-shrink-0" />
            <div className="text-xs font-semibold">
              Bạn chưa đăng nhập. Một số mã có thể yêu cầu đăng nhập tài khoản để áp dụng khi mua hàng.
              <a href="/login" className="text-indigo-600 underline hover:text-indigo-500 ml-1">Đăng nhập ngay</a>
            </div>
          </div>
        )}

        {/* Voucher Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium">
            ⚠️ {error}
          </div>
        ) : filteredVouchers.length === 0 ? (
          <EmptyState
            title="Không tìm thấy mã giảm giá nào"
            message="Hiện tại chưa có chương trình khuyến mãi nào được mở, hoặc mã giảm giá bạn tìm không khớp."
            icon="🎟️"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVouchers.map((voucher) => {
              const isCopied = copiedCode === voucher.code;
              const isPercent = voucher.discountType === 'percent';
              
              // Format descriptions
              const scopeText = voucher.applyScope === 'all' 
                ? 'Tất cả sản phẩm' 
                : voucher.applyScope === 'category'
                ? 'Danh mục sản phẩm áp dụng riêng'
                : 'Một số sản phẩm cụ thể';

              return (
                <div 
                  key={voucher._id}
                  className="bg-white rounded-2xl border border-indigo-100/70 shadow-md hover:shadow-xl transition-all duration-300 flex overflow-hidden group min-h-[140px] items-stretch relative"
                >
                  {/* Left Side: Ticket Stubs details */}
                  <div className="w-1/3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 flex flex-col justify-center items-center text-center relative flex-shrink-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 w-3 h-6 bg-gray-50/50 rounded-l-full z-10"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-6 bg-gray-50/50 rounded-r-full z-10"></div>
                    
                    <Gift size={26} className="mb-2 text-yellow-300" />
                    <div className="text-xl font-black">
                      {isPercent ? `${voucher.discountValue}%` : formatPrice(voucher.discountValue).replace('đ', '')}
                    </div>
                    <div className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">
                      {isPercent ? 'GIẢM GIÁ' : 'VND GIẢM'}
                    </div>
                  </div>

                  {/* Dotted border separator */}
                  <div className="border-l border-dashed border-indigo-200 relative my-2 z-10"></div>

                  {/* Right Side: Details and action */}
                  <div className="flex-1 p-5 flex flex-col justify-between space-y-3 bg-white">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-black border border-indigo-100 tracking-wider">
                          {voucher.code}
                        </span>
                        {voucher.expiryDate && (
                          <div className="flex items-center">
                            <span className="text-[10px] text-slate-400 font-bold">
                              HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
                            </span>
                            {(() => {
                              const diff = new Date(voucher.expiryDate) - new Date();
                              const isExpiringSoon = diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
                              return isExpiringSoon ? (
                                <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 ml-1.5 animate-pulse">Sắp hết hạn</span>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-sm font-extrabold text-slate-800 mt-2 line-clamp-1">
                        {voucher.name || `Ưu đãi giảm giá mã ${voucher.code}`}
                      </h3>
                      
                      <div className="space-y-1 mt-1 text-[11px] text-slate-500 font-semibold">
                        {voucher.minOrderValue > 0 && (
                          <div>• Đơn tối thiểu: <span className="text-indigo-600 font-extrabold">{formatPrice(voucher.minOrderValue)}</span></div>
                        )}
                        {voucher.maxDiscount > 0 && isPercent && (
                          <div>• Giảm tối đa: <span className="text-indigo-600 font-extrabold">{formatPrice(voucher.maxDiscount)}</span></div>
                        )}
                        <div>• Áp dụng cho: {scopeText}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3 gap-4">
                      {/* Left: Usage stats & progress bar */}
                      {voucher.usageLimit ? (
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                            <span>Đã dùng: {voucher.usedCount || 0}/{voucher.usageLimit}</span>
                            <span>{Math.round(((voucher.usedCount || 0) / voucher.usageLimit) * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${Math.round(((voucher.usedCount || 0) / voucher.usageLimit) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle size={10} /> Không giới hạn lượt
                        </div>
                      )}

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          to="/"
                          className="px-2.5 py-1.5 bg-gray-50 border border-gray-150 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all"
                        >
                          Dùng ngay
                        </Link>
                        <button
                          onClick={() => handleCopyCode(voucher.code)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black tracking-wide shadow-sm transition-all duration-200 cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle size={13} /> Đã lưu
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> Lưu mã
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
