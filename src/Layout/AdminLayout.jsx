
import {  Outlet } from 'react-router-dom';

import AdminNavbar from '../AdminComponents/AdminNavbar';

function AdminLayout() {
  return (
    <div className="h-screen w-full bg-[#0D1117] flex flex-col lg:flex-row p-3 gap-3">
      {/* NavBar */}
      <div className="w-full lg:w-auto">
        <AdminNavbar />
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#25293B] p-4 rounded-3xl shadow-[0_5px_10px_rgba(147,_51,_234,_0.7)] min-h-[70vh] overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
