import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { sendMessageToGemini, clearChatHistory } from "../../api/gemini.api";
import styles from "./AiAssistant.module.css";

interface Message {
  role: "user" | "ai";
  text: string;
}

// Быстрые подсказки на двух языках
const QUICK_CHIPS = {
  ru: [
    { label: "📚 Посоветуй книгу", text: "Посоветуй хорошую книгу" },
    { label: "🔍 Детективы", text: "Какие детективы есть в каталоге?" },
    { label: "💰 Дешевле 200 сом", text: "Как найти книги дешевле 200 сом?" },
  ],
  ky: [
    { label: "📚 Китеп сунуш", text: "Жакшы китеп сунуш кыл" },
    { label: "🔍 Детективдер", text: "Каталогдо кандай детективдер бар?" },
    { label: "💰 Арзан китеп", text: "200 сомдон арзан китепти кантип табам?" },
  ],
};

const WELCOME = {
  ru: "Привет! 👋 Я помогу найти книгу или разобраться с сайтом. Что вас интересует?",
  ky: "Салам! 👋 Мен сизге китеп табууга жардам берем. Эмне кызыктырат?",
};

const PLACEHOLDER = {
  ru: "Написать сообщение...",
  ky: "Суроо жаз...",
};

const TITLE = {
  ru: "AI Помощник",
  ky: "AI Жардамчы",
};

const ONLINE = {
  ru: "Онлайн • Gemini",
  ky: "Онлайн • Gemini",
};

const ERROR_MSG = {
  ru: "Ошибка. Попробуйте снова.",
  ky: "Ката кетти. Кайра аракет кылыңыз.",
};

const AiAssistant = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language === "ky" ? "ky" : "ru") as "ru" | "ky";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: WELCOME[lang] },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Обновляем приветствие при смене языка
  useEffect(() => {
    setMessages([{ role: "ai", text: WELCOME[lang] }]);
    setShowChips(true);
    clearChatHistory();
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: msgText }]);
    setInput("");
    setShowChips(false);
    setLoading(true);

    try {
      const response = await sendMessageToGemini(msgText, lang);
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: ERROR_MSG[lang] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {isOpen && (
        <div className={styles.chatBox}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.iconWrap}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <div className={styles.headerTitle}>{TITLE[lang]}</div>
                <div className={styles.headerSub}>{ONLINE[lang]}</div>
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === "user" ? styles.userMsg : styles.aiMsg}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className={styles.aiMsg}>
                <span className={styles.dots}>
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          {showChips && (
            <div className={styles.chips}>
              {QUICK_CHIPS[lang].map((chip, i) => (
                <button
                  key={i}
                  className={styles.chip}
                  onClick={() => handleSend(chip.text)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className={styles.inputArea}>
            <input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={PLACEHOLDER[lang]}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSend()}
              disabled={loading}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        className={styles.fab}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="AI Assistant"
      >
        {isOpen ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default AiAssistant;
