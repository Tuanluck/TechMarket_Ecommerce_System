export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-gray-400">
          &copy; {currentYear} TechMarket E-commerce System. All rights reserved.
        </p>
        <p className="text-xs text-gray-300 mt-1">
          Developed by Senior Frontend Team
        </p>
      </div>
    </footer>
  )
}
