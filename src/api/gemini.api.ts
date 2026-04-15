import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

type ChatMessage = { role: "user" | "model"; parts: { text: string }[] };

let chatHistory: ChatMessage[] = [];

const getSystemContext = (lang: "ru" | "ky") => {
  if (lang === "ky") {
    return `
Сен Chilisten сайтынын AI жардамчысысың.
Chilisten — бул Кыргызстандагы китеп маркетплейси. Колдонуучулар бул жерде колдонулган китептерди сатышат жана сатып алышат.

Сайт жөнүндө маалымат:
- Каталог: жанр, абал (эң жакшы / жакшы / орточо), шаар, баа боюнча фильтрлер бар
- Жанрлар: көркөм, non-fiction, детектив, романтика, илим, билим, тарых, өмүр баяны, балдар, ырчылык, бизнес, психология
- Сатуучулар WhatsApp же Telegram аркылуу байланышат
- Китептерди кошуу үчүн "Китеп сатуу" баскычын басуу керек
- Сатып алуучу менен сатуучу түздөн-түз байланышат

Сенин милдетиң:
- Колдонуучуга китеп табууга жардам берүү
- Жанр же автор боюнча кеңеш берүү
- Сайттын функцияларын түшүндүрүү
- Дайыма кыргызча жооп берүү
- Кыска жана так жооп берүү (2-4 сүйлөм)
    `;
  }

  return `
Ты AI-ассистент сайта Chilisten.
Chilisten — это книжный маркетплейс Кыргызстана. Здесь пользователи продают и покупают книги.

Информация о сайте:
- Каталог: фильтры по жанру, состоянию (отличное / хорошее / удовлетворительное), городу и цене
- Жанры: художественная, non-fiction, детектив, романтика, наука, образование, история, биография, детские, поэзия, бизнес, психология
- Продавцы общаются через WhatsApp или Telegram
- Чтобы добавить книгу — нажать "Продать книгу"
- Покупатель и продавец общаются напрямую

Твоя задача:
- Помогать пользователю найти книгу
- Давать советы по жанру или автору
- Объяснять функции сайта
- Всегда отвечать по-русски
- Отвечать кратко и по делу (2-4 предложения)
  `;
};

export const sendMessageToGemini = async (
  userMessage: string,
  lang: "ru" | "ky" = "ru",
): Promise<string> => {
  try {
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: getSystemContext(lang),
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    chatHistory.push(
      { role: "user", parts: [{ text: userMessage }] },
      { role: "model", parts: [{ text: response }] },
    );

    // Ограничиваем историю последними 10 сообщениями
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10);
    }

    return response;
  } catch (error) {
    console.error("Gemini error:", error);
    throw error;
  }
};

export const clearChatHistory = () => {
  chatHistory = [];
};
