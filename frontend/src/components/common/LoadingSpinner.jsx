export default function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} animate-spin rounded-full border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent`}
        role="status"
      >
        <span className="sr-only">Đang tải...</span>
      </div>
    </div>
  )
}
