import kgJSON from "./ky.json";
import ruJSON from "./ru.json";

import "i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      ru: typeof ruJSON;
      kg: typeof kgJSON;
    };
    defaultNS: "ru";
  }
}
