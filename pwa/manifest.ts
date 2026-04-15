export const getAppManifest = (BASE: string) => {
  return {
    name: "Chilisten",
    id: "chilisten-bookstore",
    short_name: "Chilisten",
    description: "Маркетплейс книг: покупай, продавай и читай больше",
    start_url: BASE,
    display: "standalone",
    background_color: "#fdf8f3",
    theme_color: "#8b5e3c",
    categories: ["shopping", "books", "education"],
    scope: BASE,
    icons: [
      {
        src: `${BASE}android-chrome-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${BASE}android-chrome-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${BASE}android-chrome-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${BASE}android-chrome-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    screenshots: [
      {
        src: `${BASE}screenshot-desktop.png`,
        sizes: "1920x1080",
        type: "image/png",
        label: "Chilisten Marketplace Desktop",
        form_factor: "wide",
      },
      {
        src: `${BASE}screenshot-mobile.png`,
        sizes: "1080x1920",
        type: "image/png",
        label: "Chilisten Marketplace Mobile",
        form_factor: "narrow",
      },
    ],

    shortcuts: [
      {
        name: "Выставить книгу",
        short_name: "Продать",
        description: "Добавить новую книгу в каталог",
        url: `${BASE}profile/my-books?action=add`,
        icons: [
          {
            src: `${BASE}icons/plus-96x96.png`,
            sizes: "96x96",
          },
        ],
      },
    ],

    edge_side_panel: {
      preferred_width: 480,
    },
  };
};
