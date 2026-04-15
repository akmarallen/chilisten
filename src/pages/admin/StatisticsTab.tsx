import { useState, useEffect, ReactElement } from "react";
import { supabase } from "../../lib/supabase";

interface Stats {
  totalBooks: number;
  pendingBooks: number;
  approvedBooks: number;
  rejectedBooks: number;
  totalUsers: number;
  totalReports: number;
}

interface StatCardProps {
  label: string;
  value: number;
  percentage?: string | number;
}

const StatisticsTab = (): ReactElement => {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    pendingBooks: 0,
    approvedBooks: 0,
    rejectedBooks: 0,
    totalUsers: 0,
    totalReports: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async (): Promise<void> => {
    try {
      setLoading(true);

      const [books, users, reports] = await Promise.all([
        supabase.from("books").select("status"),
        supabase.from("users").select("id"),
        supabase.from("reports").select("id"),
      ]);

      const booksData = books.data || [];
      const totalBooks = booksData.length;

      const pendingBooks = booksData.filter(
        (b) => b.status === "PENDING",
      ).length;
      const approvedBooks = booksData.filter(
        (b) => b.status === "ACTIVE",
      ).length;
      const rejectedBooks = booksData.filter(
        (b) => b.status === "REJECTED",
      ).length;

      setStats({
        totalBooks,
        pendingBooks,
        approvedBooks,
        rejectedBooks,
        totalUsers: users.data?.length || 0,
        totalReports: reports.data?.length || 0,
      });
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, percentage }: StatCardProps) => (
    <div
      style={{
        padding: "1.5rem",
        background: "#f5f5f5",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <p style={{ margin: "0 0 0.5rem 0", color: "#7f8c8d" }}>{label}</p>
      <h2 style={{ margin: 0, fontSize: "2rem", color: "#8B5E3C" }}>{value}</h2>
      {percentage && (
        <p style={{ margin: "0.5rem 0 0 0", color: "#27ae60" }}>
          {percentage}%
        </p>
      )}
    </div>
  );

  if (loading) return <div>⏳ Загрузка...</div>;

  const totalBooksValue = stats.totalBooks || 1;
  const pendingPercentage = (
    (stats.pendingBooks / totalBooksValue) *
    100
  ).toFixed(1);
  const approvedPercentage = (
    (stats.approvedBooks / totalBooksValue) *
    100
  ).toFixed(1);

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem" }}>📊 Статистика</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <StatCard label="Всего книг" value={stats.totalBooks} />
        <StatCard
          label="На модерации"
          value={stats.pendingBooks}
          percentage={pendingPercentage}
        />
        <StatCard
          label="Одобрено"
          value={stats.approvedBooks}
          percentage={approvedPercentage}
        />
        <StatCard label="Отклонено" value={stats.rejectedBooks} />
        <StatCard label="Пользователей" value={stats.totalUsers} />
        <StatCard label="Жалоб" value={stats.totalReports} />
      </div>
    </div>
  );
};

export default StatisticsTab;
