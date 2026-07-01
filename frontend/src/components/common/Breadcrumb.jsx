import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex text-xs sm:text-sm font-semibold text-gray-400 select-none pb-2 items-center gap-1.5 overflow-x-auto no-scrollbar">
      <Link to="/" className="hover:text-indigo-600 transition-colors">
        Trang chủ
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="text-gray-300 font-normal">/</span>
          {item.href ? (
            <Link to={item.href} className="hover:text-indigo-600 transition-colors whitespace-nowrap">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600 whitespace-nowrap font-bold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
