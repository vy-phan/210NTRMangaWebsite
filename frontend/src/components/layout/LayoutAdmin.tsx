import { Outlet } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"

const LayoutAdmin = () => {
  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-8 bg-base-100">
        <Outlet />
      </main>
    </div>
  )
}

export default LayoutAdmin
