import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-medium">School Leave Management System</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="opacity-75">Officer:</span> John Smith
          </div>
          <button className="bg-white bg-opacity-20 px-3 py-1 rounded hover:bg-opacity-30 transition-colors text-sm">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
