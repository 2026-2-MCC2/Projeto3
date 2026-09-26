import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";
import "../../styles/admin-panel.css";
import "./AdminPanelLayout.css";

export default function AdminPanelLayout() {
  return (
    <div className="admin-panel">
      <AdminSidebar />
      <main className="admin-panel__content">
        <Outlet />
      </main>
    </div>
  );
}
