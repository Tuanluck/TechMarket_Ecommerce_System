import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { formatPrice } from '../../utils/helpers';
import { Percent, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FlashSaleBanner({ flashSaleData }) {
  const [flashSale, setFlashSale] = useState(flashSaleData || null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // If flashSaleData is not passed as a prop, fetch it from API
  useEffect(() => {
    if (flashSaleData) {
      setFlashSale(flashSaleData);
      const now = new Date();
      const start = new Date(flashSaleData.startTime);
      setIsUpcoming(start > now);
      return;
    }

    axiosInstance
      .get('/flash-sales/active')
      .then((res) => {
        if (res.data.success && res.data.data) {
          const sale = res.data.data;
          setFlashSale(sale);
          const now = new Date();
          const start = new Date(sale.startTime);
          setIsUpcoming(start > now);
        }
      })
      .catch((err) => {
        console.error('Error fetching active flash sale:', err);
      });
  }, [flashSaleData]);

  // Countdown timer
  useEffect(() => {
    if (!flashSale) return;

    const targetDate = isUpcoming ? new Date(flashSale.startTime) : new Date(flashSale.endTime);

    const updateTimer = () => {
      const diff = targetDate.getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('Đã kết thúc');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [flashSale, isUpcoming]);

  // Autoplay sliding/transition between flash sale products
  useEffect(() => {
    if (!flashSale || !flashSale.products || flashSale.products.length <= 1) return;

    const autoPlayInterval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % flashSale.products.length);
        setIsTransitioning(false);
      }, 300); // match fade transition duration
    }, 3500);

    return () => clearInterval(autoPlayInterval);
  }, [flashSale]);

  if (!flashSale || timeLeft === 'Đã kết thúc') return null;

  const productsList = flashSale.products || [];
  if (productsList.length === 0) return null;

  const currentItem = productsList[activeIndex];
  if (!currentItem || !currentItem.productId) return null;

  const activeProduct = currentItem.productId;
  const percentOff = Math.round(((activeProduct.basePrice - currentItem.promoPrice) / activeProduct.basePrice) * 100);

  const handleNext = (e) => {
    e.preventDefault();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % productsList.length);
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + productsList.length) % productsList.length);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="bg-gradient-to-b from-red-500 via-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden border border-red-400/20 h-full flex flex-col justify-between min-h-[320px] md:h-[380px]">
      {/* Decorative background circle */}
      <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header section (Compact) */}
      <div className="space-y-3.5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg shadow-inner">
              <Percent size={16} className="text-white" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-wider bg-yellow-400 text-red-700 px-2 py-0.5 rounded-md shadow-sm">
              {isUpcoming ? 'Sắp mở bán' : 'Flash Sale'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-inner">
            <Clock size={12} className="text-yellow-300" />
            <span className="font-mono text-xs font-bold tracking-wider text-yellow-300">
              {timeLeft}
            </span>
          </div>
        </div>

        <h3 className="text-sm font-black uppercase tracking-wide border-b border-white/15 pb-2 truncate max-w-full">
          {flashSale.name}
        </h3>
      </div>

      {/* Single Autoplay Product Content */}
      <div className="relative z-10 my-4 flex-1 flex flex-col justify-center">
        <Link
          to={`/products/${activeProduct.slug}`}
          className={`bg-white rounded-xl p-3 text-slate-800 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[180px] md:h-[220px] group ${
            isTransitioning ? 'opacity-30 scale-[0.98]' : 'opacity-100 scale-100'
          }`}
        >
          <div className="flex gap-3 h-full items-center">
            {/* Left side: Image */}
            <div className="relative w-24 h-24 md:w-28 md:h-28 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
              <img
                src={activeProduct.thumbnail}
                alt={activeProduct.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {percentOff > 0 && (
                <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                  -{percentOff}%
                </span>
              )}
            </div>

            {/* Right side: Product details */}
            <div className="flex-1 flex flex-col justify-between h-full py-1">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">
                  {activeProduct.name}
                </h4>
              </div>

              <div className="space-y-1.5">
                <div>
                  <div className="text-sm md:text-base font-black text-red-600 leading-none">
                    {formatPrice(currentItem.promoPrice)}
                  </div>
                  <div className="text-[10px] text-slate-400 line-through leading-none">
                    {formatPrice(activeProduct.basePrice)}
                  </div>
                </div>

                {/* Progress bar */}
                {!isUpcoming && (
                  <div className="w-full">
                    <div className="flex justify-between text-[8px] font-bold text-slate-500 mb-0.5">
                      <span>Đã bán {currentItem.soldQuantity}</span>
                      <span>Kho: {currentItem.maxQuantity}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentItem.soldQuantity / currentItem.maxQuantity) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer slide controller dots & navigation buttons */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-2">
        {/* Navigation arrows */}
        <button
          onClick={handlePrev}
          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/5 cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Indicators */}
        <div className="flex gap-1.5">
          {productsList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
            ></button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/5 cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
