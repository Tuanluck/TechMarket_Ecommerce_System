import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    id: 1,
    title: 'Siêu Hội Điện Thoại Mới',
    subtitle: 'Đón đầu công nghệ - Trải nghiệm cực đỉnh',
    description: 'Giảm giá cực sốc lên tới 35% tất cả các mẫu điện thoại flagship mới nhất. Hỗ trợ trả góp 0% lãi suất.',
    discountTag: 'Sale 35%',
    ctaText: 'Mua Ngay',
    link: '/?category=dien-thoai',
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    icon: '📱'
  },
  {
    id: 2,
    title: 'Laptop Gaming & Văn Phòng',
    subtitle: 'Hiệu năng đỉnh cao - Thiết kế hiện đại',
    description: 'Nâng cấp trải nghiệm làm việc và giải trí với các dòng laptop Core i7, Ryzen 7 thế hệ mới. Tặng bộ quà trị giá 2 triệu.',
    discountTag: 'Quà 2 Triệu',
    ctaText: 'Xem Chi Tiết',
    link: '/?category=laptop',
    gradient: 'from-blue-600 via-sky-600 to-indigo-600',
    icon: '💻'
  },
  {
    id: 3,
    title: 'Phụ Kiện Thông Minh',
    subtitle: 'Mua nhiều giảm sâu - Giá cực hời',
    description: 'Tai nghe Bluetooth, sạc dự phòng sạc nhanh, đế sạc không dây đồng loạt giảm giá chỉ từ 99k. Freeship toàn quốc.',
    discountTag: 'Đồng Giá 99k',
    ctaText: 'Săn Deal Ngay',
    link: '/?category=phu-kien',
    gradient: 'from-amber-500 via-orange-600 to-red-500',
    icon: '🎧'
  }
];

export default function PromoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="relative w-full h-[320px] md:h-[380px] rounded-2xl overflow-hidden shadow-xl group border border-slate-100">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full flex flex-col justify-center px-8 md:px-16 text-white transition-opacity duration-700 ease-in-out bg-gradient-to-r ${slide.gradient} ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Decorative graphic shapes */}
              <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-12 -translate-y-12"></div>
              <div className="absolute right-12 bottom-12 text-9xl select-none opacity-10 animate-bounce hidden md:block">
                {slide.icon}
              </div>

              {/* Slide Content */}
              <div className="max-w-lg space-y-4 relative z-10">
                <span className="inline-block text-xs font-black uppercase tracking-widest bg-yellow-400 text-slate-900 px-3 py-1 rounded-full shadow-sm">
                  {slide.discountTag}
                </span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-lg font-bold text-white/90 leading-tight">
                  {slide.subtitle}
                </p>
                <p className="text-sm text-white/80 leading-relaxed hidden sm:block">
                  {slide.description}
                </p>
                <button
                  onClick={() => navigate(slide.link)}
                  className="px-6 py-2.5 bg-white text-indigo-700 hover:bg-yellow-400 hover:text-slate-900 font-extrabold text-sm rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  {slide.ctaText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10 cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10 cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}
