import { Link } from 'react-router-dom'

export default function EmptyState({ 
  title = 'Trống', 
  message = 'Không tìm thấy dữ liệu.', 
  icon = '📂', 
  actionText, 
  actionLink 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto my-8">
      <div className="text-6xl mb-4 animate-bounce duration-1000">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-100"
        >
          {actionText}
        </Link>
      )}
    </div>
  )
}
