export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/90 to-transparent">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold text-red-600">FYM</h1>
        <ul className="hidden md:flex items-center gap-6 text-sm">
          <li className="text-white cursor-pointer hover:text-gray-300 transition-colors">Home</li>
          <li className="text-gray-400 cursor-pointer hover:text-white transition-colors">TV Shows</li>
          <li className="text-gray-400 cursor-pointer hover:text-white transition-colors">Movies</li>
          <li className="text-gray-400 cursor-pointer hover:text-white transition-colors">New & Popular</li>
          <li className="text-gray-400 cursor-pointer hover:text-white transition-colors">My List</li>
        </ul>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search titles"
          className="hidden md:block bg-transparent border border-white/30 rounded px-4 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/60 transition-colors"
        />
        <button className="p-2 text-gray-300 hover:text-white transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
        <button className="p-2 text-gray-300 hover:text-white transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </button>
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
      </div>
    </nav>
  );
}
