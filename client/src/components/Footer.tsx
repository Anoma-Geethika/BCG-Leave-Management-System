export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white py-4">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} School Leave Management System. All rights reserved.</p>
      </div>
    </footer>
  );
}
