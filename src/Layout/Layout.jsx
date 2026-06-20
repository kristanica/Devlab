import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Layout() {
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
    <div className="flex flex-col lg:flex-row bg-[#0D1117] w-screen h-screen gap-5 p-4 overflow-auto lg:overflow-hidden">
      {/* Navbar */}
      <Navbar className="flex-shrink-0" />

      {/* Main Content */}
      <div className="h-auto w-full lg:w-[100%] xl:w-[90%] bg-[#25293B] p-2 rounded-4xl shadow-[0_5px_10px_rgba(147,51,234,0.7)]">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
