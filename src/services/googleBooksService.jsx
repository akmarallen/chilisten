import { GOOGLE_BOOKS_API_URL } from "../utils/const/const";

export const searchBookByISBN = async (isbn) => {
  try {
    // Проверяем что ISBN не пустой
    if (!isbn || isbn.trim().length === 0) {
      return null;
    }

    // Очищаем ISBN от пробелов и дефисов
    const cleanISBN = isbn.replace(/[\s-]/g, "");

    // Отправляем запрос к Google Books API
    const response = await fetch(
      `${GOOGLE_BOOKS_API_URL}?q=isbn:${cleanISBN}&maxResults=1`,
    );

    // Проверяем ответ
    if (!response.ok) {
      console.error("Google Books API error:", response.status);
      return null;
    }

    const data = await response.json();

    // Если нет результатов
    if (!data.items || data.items.length === 0) {
      console.log("No books found for ISBN:", isbn);
      return null;
    }

    // Получаем информацию о книге
    const book = data.items[0].volumeInfo;
    const industryIdentifiers =
      data.items[0].volumeInfo.industryIdentifiers || [];

    // Извлекаем данные
    const bookData = {
      title: book.title || "",
      author: book.authors ? book.authors.join(", ") : "",
      isbn: getISBN(industryIdentifiers),
      genre: book.categories ? book.categories[0] : "",
      description: book.description || "",
      cover_url: book.imageLinks?.thumbnail || null,
      publisher: book.publisher || "",
      publishedDate: book.publishedDate || "",
      pageCount: book.pageCount || 0,
      language: book.language || "en",
    };

    return bookData;
  } catch (error) {
    console.error("Error searching by ISBN:", error);
    return null;
  }
};

/**
 * Поиск книги по названию и автору
 * @param {string} title - Название книги
 * @param {string} author - Автор (опционально)
 * @returns {Promise<Array>} - Массив найденных книг
 */
export const searchBooks = async (title, author = "") => {
  try {
    // Проверяем что название не пустое
    if (!title || title.trim().length === 0) {
      return [];
    }

    // Строим запрос
    let query = title;
    if (author && author.trim().length > 0) {
      query += ` author:${author}`;
    }

    // Отправляем запрос к Google Books API
    const response = await fetch(
      `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=5`,
    );

    // Проверяем ответ
    if (!response.ok) {
      console.error("Google Books API error:", response.status);
      return [];
    }

    const data = await response.json();

    // Если нет результатов
    if (!data.items || data.items.length === 0) {
      console.log("No books found for query:", query);
      return [];
    }

    // Извлекаем все результаты
    const books = data.items.map((item) => {
      const book = item.volumeInfo;
      const industryIdentifiers = book.industryIdentifiers || [];

      return {
        title: book.title || "",
        author: book.authors ? book.authors.join(", ") : "",
        isbn: getISBN(industryIdentifiers),
        genre: book.categories ? book.categories[0] : "",
        description: book.description || "",
        cover_url: book.imageLinks?.thumbnail || null,
        publisher: book.publisher || "",
        publishedDate: book.publishedDate || "",
        pageCount: book.pageCount || 0,
        language: book.language || "en",
      };
    });

    return books;
  } catch (error) {
    console.error("Error searching by title:", error);
    return [];
  }
};

/**
 * Вспомогательная функция для извлечения ISBN из массива identifiers
 * @param {Array} identifiers - Массив идентификаторов
 * @returns {string} - ISBN номер
 */
const getISBN = (identifiers) => {
  if (!Array.isArray(identifiers) || identifiers.length === 0) {
    return "";
  }

  // Ищем ISBN-13 первым
  const isbn13 = identifiers.find((id) => id.type === "ISBN_13");
  if (isbn13) return isbn13.identifier;

  // Если нет ISBN-13, ищем ISBN-10
  const isbn10 = identifiers.find((id) => id.type === "ISBN_10");
  if (isbn10) return isbn10.identifier;

  // Если ничего не найдено, возвращаем пусто
  return "";
};

/**
 * Расширенный поиск с фильтрами
 * @param {Object} filters - Объект с фильтрами
 * @returns {Promise<Array>} - Массив найденных книг
 */
export const searchBooksAdvanced = async (filters) => {
  try {
    const {
      query,
      subject,
      publisher,
      publication_year,
      orderBy = "relevance",
    } = filters;

    // Строим сложный запрос
    let q = query || "";
    if (subject) q += ` subject:${subject}`;
    if (publisher) q += ` publisher:${publisher}`;
    if (publication_year)
      q += ` inpublisheddate:[${publication_year}-01-01 TO ${publication_year}-12-31]`;

    if (!q.trim()) {
      return [];
    }

    // Отправляем запрос с параметрами сортировки
    const response = await fetch(
      `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(q)}&maxResults=10&orderBy=${orderBy}`,
    );

    if (!response.ok) {
      console.error("Google Books API error:", response.status);
      return [];
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item) => {
      const book = item.volumeInfo;
      const industryIdentifiers = book.industryIdentifiers || [];

      return {
        title: book.title || "",
        author: book.authors ? book.authors.join(", ") : "",
        isbn: getISBN(industryIdentifiers),
        genre: book.categories ? book.categories[0] : "",
        description: book.description || "",
        cover_url: book.imageLinks?.thumbnail || null,
        publisher: book.publisher || "",
        publishedDate: book.publishedDate || "",
        pageCount: book.pageCount || 0,
        language: book.language || "en",
      };
    });
  } catch (error) {
    console.error("Error in advanced search:", error);
    return [];
  }
};

/**
 * Получить информацию о книге по Google Books ID
 * @param {string} bookId - Google Books ID
 * @returns {Promise<Object|null>} - Полная информация о книге
 */
export const getBookById = async (bookId) => {
  try {
    if (!bookId) {
      return null;
    }

    const response = await fetch(`${GOOGLE_BOOKS_API_URL}/${bookId}`);

    if (!response.ok) {
      console.error("Google Books API error:", response.status);
      return null;
    }

    const data = await response.json();
    const book = data.volumeInfo;
    const industryIdentifiers = book.industryIdentifiers || [];

    return {
      id: data.id,
      title: book.title || "",
      author: book.authors ? book.authors.join(", ") : "",
      isbn: getISBN(industryIdentifiers),
      genre: book.categories ? book.categories[0] : "",
      description: book.description || "",
      cover_url: book.imageLinks?.thumbnail || null,
      cover_url_large:
        book.imageLinks?.medium || book.imageLinks?.large || null,
      publisher: book.publisher || "",
      publishedDate: book.publishedDate || "",
      pageCount: book.pageCount || 0,
      language: book.language || "en",
      previewLink: book.previewLink || "",
      infoLink: book.infoLink || "",
      averageRating: book.averageRating || null,
      ratingsCount: book.ratingsCount || 0,
    };
  } catch (error) {
    console.error("Error getting book by ID:", error);
    return null;
  }
};

/**
 * Получить обложку книги в большом размере
 * @param {string} isbn - ISBN номер книги
 * @returns {Promise<string|null>} - URL большой обложки или null
 */
export const getBookCoverLarge = async (isbn) => {
  try {
    if (!isbn) {
      return null;
    }

    const result = await searchBookByISBN(isbn);
    if (result) {
      // Заменяем размер обложки на больший
      return result.cover_url?.replace("zoom=1", "zoom=2") || null;
    }

    return null;
  } catch (error) {
    console.error("Error getting book cover:", error);
    return null;
  }
};

/**
 * Валидировать ISBN
 * @param {string} isbn - ISBN номер
 * @returns {boolean} - Валиден ли ISBN
 */
export const validateISBN = (isbn) => {
  if (!isbn) return false;

  // Удаляем пробелы и дефисы
  const clean = isbn.replace(/[\s-]/g, "");

  // Проверяем длину (ISBN-10 или ISBN-13)
  if (clean.length !== 10 && clean.length !== 13) {
    return false;
  }

  // Проверяем что это числа
  if (!/^\d+$/.test(clean)) {
    return false;
  }

  // Базовая валидация контрольной суммы для ISBN-10
  if (clean.length === 10) {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(clean[i]) * (10 - i);
    }
    return sum % 11 === 0;
  }

  // Базовая валидация контрольной суммы для ISBN-13
  if (clean.length === 13) {
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(clean[i]) * (i % 2 === 0 ? 1 : 3);
    }
    return sum % 10 === 0;
  }

  return false;
};

/**
 * Форматировать ISBN для отображения
 * @param {string} isbn - ISBN номер
 * @returns {string} - Форматированный ISBN
 */
export const formatISBN = (isbn) => {
  if (!isbn) return "";

  const clean = isbn.replace(/[\s-]/g, "");

  if (clean.length === 10) {
    return `${clean.slice(0, 1)}-${clean.slice(1, 4)}-${clean.slice(4, 9)}-${clean.slice(9)}`;
  }

  if (clean.length === 13) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 4)}-${clean.slice(4, 9)}-${clean.slice(9, 12)}-${clean.slice(12)}`;
  }

  return isbn;
};

// ============================================================
// ЭКСПОРТИРУЕМ ВСЕ ФУНКЦИИ
// ============================================================

export default {
  searchBookByISBN,
  searchBooks,
  searchBooksAdvanced,
  getBookById,
  getBookCoverLarge,
  validateISBN,
  formatISBN,
};
