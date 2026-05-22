import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Welcome" },
  { to: "/portfolio", label: "Observatory" },
  { to: "/admin", label: "Command Center" }
];

function Navigation() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5"
    >
      <div className="floating-pill flex items-center gap-2 rounded-full px-2 py-2">
        <div className="flex items-center gap-3 px-4">
          <span className="h-2 w-2 rounded-full bg-nnkienn-pink" />
          <div className="leading-none">
            <p className="text-[0.58rem] uppercase tracking-[0.42em] text-white/40">NNKIENN Render</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.34em] text-white/72">Minimal 3D Archive</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2 text-[0.68rem] uppercase tracking-[0.3em] transition duration-300",
                  isActive
                    ? "border border-white/10 bg-white/8 text-white"
                    : "border border-transparent text-white/48 hover:text-white/82"
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}

export default Navigation;
