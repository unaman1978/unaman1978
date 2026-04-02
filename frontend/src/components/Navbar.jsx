import { NavLink } from 'react-router-dom';

const links = [
  { label: 'Home', path: '/' },
  { label: 'Upload Scan', path: '/upload' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'About', path: '/about' }
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-blue-700">OncoAI</h1>
        <div className="flex gap-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-blue-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
