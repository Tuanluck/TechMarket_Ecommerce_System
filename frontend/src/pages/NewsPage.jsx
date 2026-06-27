import React, { useState } from 'react';
import { Search, Calendar, User, Clock, ArrowRight, Rss } from 'lucide-react';
import toast from 'react-hot-toast';

const ARTICLES = [
  {
    id: 1,
    title: 'Đánh giá chi tiết iPhone mới nhất: Có đáng để nâng cấp?',
    category: 'Đánh giá',
    excerpt: 'Khám phá hiệu năng chip thế hệ mới, cải tiến camera zoom quang học và thời lượng pin vượt bậc trên mẫu điện thoại flagship mới nhất vừa ra mắt.',
    author: 'Minh Tuấn',
    date: '25/06/2026',
    readTime: '6 phút',
    thumbnail: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 2,
    title: 'Top 5 Laptop sinh viên đáng mua nhất mùa tựu trường 2026',
    category: 'Tư vấn',
    excerpt: 'Tổng hợp danh sách các mẫu laptop có cấu hình mạnh mẽ, thời lượng pin trâu, trọng lượng nhẹ dưới 1.5kg cùng mức giá cực kỳ phải chăng dành cho sinh viên.',
    author: 'Quốc Cường',
    date: '24/06/2026',
    readTime: '5 phút',
    thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 3,
    title: 'Mẹo tối ưu dung lượng pin cho điện thoại Android cực dễ',
    category: 'Mẹo vặt',
    excerpt: 'Chỉ với 5 bước đơn giản cấu hình lại hệ thống, bạn có thể tăng thời lượng sử dụng pin lên đến 20% mà không làm giảm hiệu năng của máy.',
    author: 'Hoài Nam',
    date: '22/06/2026',
    readTime: '4 phút',
    thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 4,
    title: 'Cách lựa chọn tai nghe Bluetooth chống ồn chủ động (ANC) chuẩn nhất',
    category: 'Tư vấn',
    excerpt: 'Những tiêu chí quan trọng khi chọn mua tai nghe không dây có chống ồn: thông số dB, thiết kế đệm tai, thời lượng pin và chất lượng mic thoại.',
    author: 'Hương Giang',
    date: '20/06/2026',
    readTime: '7 phút',
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 5,
    title: 'Mạng di động 6G: Những bước chuẩn bị đầu tiên tại Việt Nam',
    category: 'Xu hướng',
    excerpt: 'Tìm hiểu về lộ trình phát triển mạng di động băng rộng thế hệ tiếp theo (6G), tốc độ kết nối lý thuyết và các ứng dụng thực tiễn trong tương lai gần.',
    author: 'Thế Anh',
    date: '18/06/2026',
    readTime: '8 phút',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 6,
    title: 'Kinh nghiệm chọn màn hình máy tính đồ họa chuyên nghiệp chuyên sâu',
    category: 'Mẹo vặt',
    excerpt: 'Khác biệt giữa tấm nền IPS, OLED; ý nghĩa của độ bao phủ màu sRGB, DCI-P3 và độ sai lệch màu Delta E trong thiết kế đồ họa hình ảnh chuyên nghiệp.',
    author: 'Đức Huy',
    date: '15/06/2026',
    readTime: '5 phút',
    thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    featured: false
  }
];

const CATEGORIES = ['Tất cả', 'Đánh giá', 'Tư vấn', 'Mẹo vặt', 'Xu hướng'];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    toast.success('Đăng ký nhận tin tức thành công!');
    setEmailInput('');
  };

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesCategory = selectedCategory === 'Tất cả' || art.category === selectedCategory;
    const matchesKeyword = art.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  const featuredArticle = ARTICLES.find(a => a.featured);
  const regularArticles = filteredArticles.filter(a => selectedCategory !== 'Tất cả' || !a.featured);

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-4">
      {/* Page Title Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
          <Rss className="text-indigo-600" /> Tin tức công nghệ
        </h1>
        <p className="text-slate-500 text-sm mt-1">Cập nhật tin tức, đánh giá sản phẩm và hướng dẫn công nghệ mới nhất mỗi ngày</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 order-2 md:order-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 order-1 md:order-2">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
        </div>
      </div>

      {/* Featured Article Box */}
      {selectedCategory === 'Tất cả' && !searchKeyword && featuredArticle && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Thumbnail */}
          <div className="h-64 lg:h-full relative min-h-[300px]">
            <img
              src={featuredArticle.thumbnail}
              alt={featuredArticle.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Nổi bật - {featuredArticle.category}
            </span>
          </div>

          {/* Details */}
          <div className="p-8 md:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                <span className="flex items-center gap-1"><Calendar size={14} /> {featuredArticle.date}</span>
                <span className="flex items-center gap-1"><User size={14} /> {featuredArticle.author}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {featuredArticle.readTime} đọc</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight hover:text-indigo-600 transition-colors cursor-pointer">
                {featuredArticle.title}
              </h2>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed font-semibold">
                {featuredArticle.excerpt}
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-extrabold text-indigo-600 hover:text-indigo-700 transition-all self-start cursor-pointer group">
              Đọc bài viết <ArrowRight size={16} className="transform group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Regular Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full py-12">
            <div className="text-center text-slate-400 text-base font-bold">Không tìm thấy bài viết nào phù hợp</div>
          </div>
        ) : (
          (selectedCategory === 'Tất cả' && !searchKeyword ? regularArticles : filteredArticles).map((art) => (
            <article 
              key={art.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
            >
              {/* Thumbnail wrapper */}
              <div className="relative pt-[56.25%] overflow-hidden bg-slate-50">
                <img
                  src={art.thumbnail}
                  alt={art.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {art.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-0.5"><Calendar size={12} /> {art.date}</span>
                    <span className="flex items-center gap-0.5"><Clock size={12} /> {art.readTime}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-semibold">
                    {art.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
                  <span className="text-slate-400 font-bold">Tác giả: {art.author}</span>
                  <span className="font-extrabold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1 transition-all cursor-pointer">
                    Đọc tiếp <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Newsletter signup Box */}
      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl p-8 md:p-12 text-white shadow-lg text-center relative overflow-hidden">
        {/* Decor background elements */}
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-md mx-auto space-y-4 relative z-10">
          <h2 className="text-2xl font-black">Nhận Bản Tin Công Nghệ Mới Nhất</h2>
          <p className="text-indigo-100 text-xs font-semibold">
            Đăng ký để nhận thông báo về các bài viết mới, đánh giá thiết bị và voucher khuyến mãi độc quyền từ TechMarket hàng tuần.
          </p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="email"
              placeholder="Nhập địa chỉ email của bạn..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-indigo-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:bg-white focus:text-slate-800 transition-all"
              required
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Đăng Ký
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
