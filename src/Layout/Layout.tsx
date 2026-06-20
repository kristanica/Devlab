import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import Prefetcher from '../components/Prefetcher';

const Layout: React.FC = () => {
  const location = useLocation();

  const isLessonView =
    location.pathname.startsWith('/Main/Lessons/Html/') ||
    location.pathname.startsWith('/Main/Lessons/Css/') ||
    location.pathname.startsWith('/Main/Lessons/JavaScript/');

  const shouldSkipLayout = isLessonView;

  if (shouldSkipLayout || location.pathname === '/codePlay' || location.pathname === '/dataPlayground') {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col lg:flex-row bg-[#06060a] w-screen h-screen p-2 sm:p-4 gap-4 overflow-hidden relative selection:bg-purple-500/30">
      
      {/* Global Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10 pointer-events-none" />
      <Prefetcher />

      {/* Navbar Container */}
      <div className="relative z-10 shrink-0">
        <Navbar />
      </div>

      {/* Main Content Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex-1 w-full bg-[#0d0d12] border border-[#2a2a3c] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

export default Layout;
