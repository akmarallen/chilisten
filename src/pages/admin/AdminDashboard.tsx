import { Users, Book, Flag, BarChart3 } from "lucide-react";

// Импортируем табы
import AllBooksTab from "./AllBooksTab";
import ReportsTab from "./ReportsTab";
import UsersTab from "./UsersTab";
import StatisticsTab from "./StatisticsTab";
import { Link, Outlet, useLocation } from "react-router-dom";

const AdminDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname;

  const tabs = [
    {
      id: "/admin/books",
      label: "Все книги",
      icon: <Book size={20} />,
      component: <AllBooksTab />,
    },
    {
      id: "/admin/reports",
      label: "Жалобы",
      icon: <Flag size={20} />,
      component: <ReportsTab />,
    },
    {
      id: "/admin/users",
      label: "Пользователи",
      icon: <Users size={20} />,
      component: <UsersTab />,
    },
    {
      id: "/admin/stats",
      label: "Статистика",
      icon: <BarChart3 size={20} />,
      component: <StatisticsTab />,
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      {/* ТАБЫ */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          borderBottom: "2px solid #ecf0f1",
        }}
      >
        {tabs.map((tab) => (
          <Link
            to={tab.id}
            key={tab.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem 1.5rem",
              border: "none",
              background: activeTab === tab.id ? "#8B5E3C" : "transparent",
              color: activeTab === tab.id ? "white" : "#7f8c8d",
              cursor: "pointer",
              borderBottom: activeTab === tab.id ? "3px solid #8B5E3C" : "none",
              transition: "all 0.2s",
            }}
          >
            {tab.icon}
            {tab.label}
          </Link>
        ))}
      </div>

      <Outlet />
      {/* <div>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{ display: activeTab === tab.id ? "block" : "none" }}
          >
            {tab.component}
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default AdminDashboard;
