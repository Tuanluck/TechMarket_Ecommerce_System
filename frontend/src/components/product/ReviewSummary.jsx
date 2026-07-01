import React from 'react';
import { Rate } from 'antd';

export default function ReviewSummary({ ratingAvg = 5, reviewTotal = 0, reviews = [] }) {
  // Compute star breakdown based on reviews array if we have some, otherwise mock or calculate from list
  const starsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  if (reviews && reviews.length > 0) {
    reviews.forEach(r => {
      const rate = Math.round(r.rating) || 5;
      if (starsCount[rate] !== undefined) {
        starsCount[rate]++;
      }
    });
  } else {
    // Mock breakdown proportional to ratingAvg for visual excellence when no reviews are active
    const ratio = ratingAvg / 5;
    starsCount[5] = Math.round(reviewTotal * ratio * 0.7);
    starsCount[4] = Math.round(reviewTotal * ratio * 0.2);
    starsCount[3] = Math.round(reviewTotal * (1 - ratio) * 0.5);
    starsCount[2] = Math.round(reviewTotal * (1 - ratio) * 0.3);
    starsCount[1] = Math.round(reviewTotal * (1 - ratio) * 0.2);
  }

  const getPercentage = (count) => {
    if (reviewTotal === 0) return 0;
    return Math.round((count / reviewTotal) * 100);
  };

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-6 lg:gap-12">
      {/* Average rating col */}
      <div className="text-center flex flex-col items-center justify-center md:border-r border-slate-200 md:pr-12 md:min-w-[160px]">
        <span className="text-5xl font-black text-slate-800 leading-none">
          {ratingAvg ? ratingAvg.toFixed(1) : '5.0'}
        </span>
        <div className="mt-2">
          <Rate disabled allowHalf value={ratingAvg || 5} style={{ fontSize: 16 }} />
        </div>
        <span className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-wider">
          {reviewTotal} đánh giá
        </span>
      </div>

      {/* Progress bars col */}
      <div className="flex-1 w-full space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = starsCount[star] || 0;
          const pct = getPercentage(count);
          return (
            <div key={star} className="flex items-center gap-3 text-xs font-bold text-slate-600">
              <span className="w-3 text-right">{star}★</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-12 text-slate-400 text-right">{pct}% ({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
