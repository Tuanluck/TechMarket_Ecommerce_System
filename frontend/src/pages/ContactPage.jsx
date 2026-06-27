import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle, ChevronDown, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FAQS = [
  {
    question: 'Làm thế nào để áp dụng mã giảm giá (voucher) vào đơn hàng?',
    answer: 'Khi tiến hành thanh toán tại trang Checkout, bạn sẽ thấy ô nhập mã giảm giá ở phần tóm tắt đơn hàng bên phải. Hãy sao chép mã từ trang "Khuyến mãi" hoặc nhập thủ công và nhấn "Áp dụng". Hệ thống sẽ tự động trừ tiền nếu đơn hàng của bạn thỏa mãn điều kiện áp dụng.'
  },
  {
    question: 'TechMarket hỗ trợ những phương thức thanh toán nào?',
    answer: 'Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD), thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard) và chuyển khoản ngân hàng trực tuyến. Một số voucher có thể áp dụng riêng cho các hình thức thanh toán nhất định.'
  },
  {
    question: 'Làm sao để kiểm tra lộ trình giao nhận của đơn hàng?',
    answer: 'Sau khi đăng nhập, bạn truy cập vào menu "Tài khoản" -> "Đơn hàng của tôi". Tại đây hiển thị danh sách đơn hàng đã mua kèm trạng thái xử lý chi tiết (Chờ xác nhận, Đang xử lý, Đang giao hàng, Đã giao hàng). Bạn cũng có thể liên hệ tổng đài hỗ trợ để kiểm tra lộ trình nhanh nhất.'
  },
  {
    question: 'Chính sách đổi trả sản phẩm lỗi của TechMarket như thế nào?',
    answer: 'TechMarket áp dụng chính sách 1 đổi 1 trong vòng 7 ngày đầu tiên kể từ khi nhận hàng đối với sản phẩm phát sinh lỗi từ nhà sản xuất. Sản phẩm đổi trả phải còn nguyên hộp, đầy đủ phụ kiện, tem bảo hành và không bị trầy xước vật lý.'
  },
  {
    question: 'Điểm loyalty tích lũy dùng để làm gì?',
    answer: 'Với mỗi đơn hàng hoàn thành, tài khoản của bạn sẽ nhận được điểm loyalty tích lũy tương ứng (tỷ lệ quy đổi thông thường là 1% giá trị đơn hàng). Điểm này dùng để phân hạng thành viên Gold/Silver hoặc quy đổi thành các voucher đặc quyền giảm giá trực tiếp cho đơn hàng sau.'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [openFaq, setOpenFaq] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    toast.success('Cảm ơn phản hồi của bạn! Đội ngũ hỗ trợ sẽ liên hệ lại sớm nhất.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-4">
      {/* Title Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
          <MessageSquare className="text-indigo-600" /> Liên hệ & Hỗ trợ
        </h1>
        <p className="text-slate-500 text-sm mt-1">TechMarket luôn sẵn sàng lắng nghe ý kiến và hỗ trợ giải quyết khó khăn của quý khách hàng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Contact details (2/5 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-md space-y-5 relative overflow-hidden">
            {/* Decors */}
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <h2 className="text-lg font-black tracking-wide border-b border-white/20 pb-3">Thông Tin Liên Hệ</h2>
            
            <div className="space-y-4 text-sm font-semibold">
              <div className="flex gap-3 items-start">
                <MapPin className="text-yellow-300 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <div className="text-white">Trụ sở chính</div>
                  <div className="text-indigo-100 text-xs font-normal mt-0.5">Số 145, Đường 3/2, Quận Ninh Kiều, TP. Cần Thơ</div>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Phone className="text-yellow-300 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <div className="text-white">Điện thoại / Hotline</div>
                  <div className="text-indigo-100 text-xs font-normal mt-0.5">1900 6789 - (0292) 3888 999</div>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Mail className="text-yellow-300 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <div className="text-white">Email hỗ trợ</div>
                  <div className="text-indigo-100 text-xs font-normal mt-0.5">support@techmarket.com.vn</div>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Clock className="text-yellow-300 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <div className="text-white">Thời gian làm việc</div>
                  <div className="text-indigo-100 text-xs font-normal mt-0.5">Thứ 2 - Chủ Nhật (08:00 - 21:30)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Styled Vector Map Placeholder */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Vị Trí Cửa Hàng</h3>
            <div className="bg-indigo-50 border border-indigo-100/60 rounded-xl h-44 flex flex-col justify-center items-center gap-2 relative overflow-hidden group">
              {/* Fake map drawing circles */}
              <div className="absolute inset-0 bg-[radial-gradient(#c7d2fe_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
              <div className="absolute w-24 h-24 bg-indigo-500/10 rounded-full animate-ping pointer-events-none"></div>
              <div className="absolute w-12 h-12 bg-indigo-500/20 rounded-full pointer-events-none"></div>
              
              <MapPin size={32} className="text-indigo-600 relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
              <div className="text-xs font-bold text-indigo-900 relative z-10">Bản đồ TechMarket Ninh Kiều</div>
              <div className="text-[10px] text-indigo-500 font-semibold relative z-10">Nhấn để xem chỉ đường chi tiết</div>
            </div>
          </div>
        </div>

        {/* Right Column: Feedback form (3/5 width) */}
        <div className="lg:col-span-3 bg-white p-6 md:p-8 border border-gray-100 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-800">Gửi Phản Hồi Cho Chúng Tôi</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0901234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Chủ đề liên hệ</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Hỏi đáp sản phẩm, giao hàng..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nội dung tin nhắn *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Nhập nội dung bạn cần hỗ trợ..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                required
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md text-white font-extrabold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <Send size={16} /> Gửi Phản Hồi
            </button>
          </form>
        </div>
      </div>

      {/* Frequently Asked Questions section */}
      <div className="space-y-6 border-t border-gray-150 pt-10">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 justify-center">
          <HelpCircle className="text-indigo-600" /> Câu Hỏi Thường Gặp (FAQs)
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer text-sm md:text-base gap-4"
                >
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 flex-shrink-0 transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} 
                  />
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 opacity-100 border-t border-slate-50' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="px-6 py-4 text-xs md:text-sm text-slate-500 font-semibold leading-relaxed bg-slate-50/50">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
