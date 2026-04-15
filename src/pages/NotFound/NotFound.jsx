import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Search, BookOpen } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .notfound-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
        }

        .notfound-content {
          text-align: center;
          max-width: 600px;
          animation: fadeIn 0.6s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notfound-icon {
          font-size: 6rem;
          margin-bottom: 1.5rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .notfound-code {
          font-size: 5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #8B5E3C, #A0602A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'Playfair Display', serif;
          margin-bottom: 0.5rem;
        }

        .notfound-title {
          font-size: 2rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1rem;
          font-family: 'Playfair Display', serif;
        }

        .notfound-subtitle {
          font-size: 1.1rem;
          color: #7f8c8d;
          margin-bottom: 2rem;
          line-height: 1.6;
          font-family: 'DM Sans', sans-serif;
        }

        .notfound-description {
          font-size: 0.95rem;
          color: #95a5a6;
          margin-bottom: 3rem;
          font-family: 'DM Sans', sans-serif;
        }

        .notfound-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .btn {
          padding: 0.8rem 1.8rem;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #8B5E3C, #A0602A);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 94, 60, 0.3);
        }

        .btn-secondary {
          background: white;
          color: #8B5E3C;
          border: 2px solid #8B5E3C;
        }

        .btn-secondary:hover {
          background: #f9f4f0;
          transform: translateY(-2px);
        }

        .notfound-suggestions {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          text-align: left;
          margin-top: 2rem;
        }

        .notfound-suggestions h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1.2rem;
          font-family: 'Playfair Display', serif;
        }

        .notfound-links {
          display: grid;
          gap: 0.8rem;
        }

        .notfound-link {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem 1rem;
          text-decoration: none;
          color: #2c3e50;
          border-radius: 6px;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          border-left: 3px solid transparent;
        }

        .notfound-link:hover {
          background: #f5f5f5;
          color: #8B5E3C;
          border-left-color: #8B5E3C;
          padding-left: 1.3rem;
        }

        .notfound-link-icon {
          color: #8B5E3C;
          flex-shrink: 0;
        }

        .notfound-illustration {
          margin: 2rem 0;
          opacity: 0.8;
        }

        @media (max-width: 600px) {
          .notfound-code {
            font-size: 3.5rem;
          }

          .notfound-title {
            font-size: 1.5rem;
          }

          .notfound-icon {
            font-size: 4rem;
          }

          .notfound-buttons {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }

          .notfound-suggestions {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className="notfound-container">
        <div className="notfound-content">
          {/* ИКОНКА */}
          <div className="notfound-icon">📚</div>

          {/* КОД ОШИБКИ */}
          <div className="notfound-code">404</div>

          {/* ЗАГОЛОВОК */}
          <h1 className="notfound-title">Страница не найдена</h1>

          {/* ПОДЗАГОЛОВОК */}
          <p className="notfound-subtitle">
            К сожалению, мы не смогли найти нужную вам страницу
          </p>

          {/* ОПИСАНИЕ */}
          <p className="notfound-description">
            Возможно, страница была удалена, перемещена или адрес введён
            неправильно. Попробуйте перейти на главную страницу или используйте
            поиск.
          </p>

          {/* КНОПКИ */}
          <div className="notfound-buttons">
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              <Home size={18} />
              На главную
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/catalog")}
            >
              <Search size={18} />В каталог
            </button>
          </div>

          {/* ПРЕДЛОЖЕНИЯ */}
          <div className="notfound-suggestions">
            <h3>🔍 Что вы можете сделать:</h3>
            <div className="notfound-links">
              <button
                className="notfound-link"
                onClick={() => navigate("/")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span className="notfound-link-icon">🏠</span>
                <span>Перейти на главную страницу</span>
              </button>
              <button
                className="notfound-link"
                onClick={() => navigate("/catalog")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span className="notfound-link-icon">📖</span>
                <span>Посмотреть каталог книг</span>
              </button>
              <button
                className="notfound-link"
                onClick={() => navigate("/new-book")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span className="notfound-link-icon">➕</span>
                <span>Продать книгу</span>
              </button>
              <button
                className="notfound-link"
                onClick={() => navigate(-1)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span className="notfound-link-icon">⬅️</span>
                <span>Вернуться на предыдущую страницу</span>
              </button>
            </div>
          </div>

          {/* ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ */}
          <div
            style={{
              marginTop: "3rem",
              padding: "1.5rem",
              background: "#fff3e0",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#7f8c8d",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            💡 Если вы уверены, что эта страница должна существовать,
            <br />
            пожалуйста,{" "}
            <a
              href="mailto:support@chilisten.kg"
              style={{
                color: "#8B5E3C",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              свяжитесь с нами
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
