import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";

import Navigation from "./components/Navigation";
import CommandCenter from "./pages/CommandCenter";
import Observatory from "./pages/Observatory";
import Welcome from "./pages/Welcome";

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <Navigation />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Welcome />} />
            <Route path="/portfolio" element={<Observatory />} />
            <Route path="/admin" element={<CommandCenter />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
