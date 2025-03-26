import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path 
      ? "bg-white bg-opacity-20 font-medium" 
      : "hover:bg-white hover:bg-opacity-10";
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex items-center justify-between mb-4 md:mb-0">
          <div onClick={() => window.location.href = '/'}>
            <h1 className="text-xl font-medium cursor-pointer">පාසල් නිවාඩු කළමනාකරණ පද්ධතිය</h1>
          </div>
          
          <div className="md:hidden">
            <div className="text-sm">
              <span className="opacity-75">නිලධාරියා:</span> ජෝන් ස්මිත්
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <nav className="flex md:items-center space-x-1">
            <div className={`px-3 py-2 rounded text-sm transition-colors cursor-pointer ${isActive('/dashboard')}`} onClick={() => window.location.href = '/dashboard'}>
              පුවරුව
            </div>
            <div className={`px-3 py-2 rounded text-sm transition-colors cursor-pointer ${isActive('/leave-management')}`} onClick={() => window.location.href = '/leave-management'}>
              නිවාඩු කළමනාකරණය
            </div>
            <div className={`px-3 py-2 rounded text-sm transition-colors cursor-pointer ${isActive('/teacher-management')}`} onClick={() => window.location.href = '/teacher-management'}>
              ගුරු කළමනාකරණය
            </div>
            <div className={`px-3 py-2 rounded text-sm transition-colors cursor-pointer ${isActive('/reports')}`} onClick={() => window.location.href = '/reports'}>
              වාර්තා
            </div>
          </nav>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="text-sm">
              <span className="opacity-75">නිලධාරියා:</span> ජෝන් ස්මිත්
            </div>
            <button className="bg-white bg-opacity-20 px-3 py-1 rounded hover:bg-opacity-30 transition-colors text-sm">
              පිටවීම
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
