import { NavLink, Link } from 'react-router-dom';
import { FiLayout, FiFileText, FiUsers, FiArrowLeftCircle } from 'react-icons/fi'; // Cài: npm install react-icons

const AdminSidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-base-200 p-4 flex flex-col">
      <div className="mb-8">
        <Link to="/admin" className="btn btn-ghost text-2xl font-bold">
          Admin 
        </Link>
      </div>

      {/* Menu Điều Hướng */}
      <ul className="menu text-base-content flex-grow">
        <li>
          <NavLink to="/admin" end> 
            <FiLayout />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/mangas">
            <FiFileText />
            Quản lý Truyện
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/genres">
            <FiUsers />
            Quản lý Thể Loại
          </NavLink>
        </li>
      </ul>

      {/* Nút Quay Lại Trang Chủ */}
      <div className="mt-auto">
        <Link to="/" className="btn btn-ghost w-full justify-start">
          <FiArrowLeftCircle />
          Về trang chủ
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;