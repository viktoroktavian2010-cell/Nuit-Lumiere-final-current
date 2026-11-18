import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "ru" | "ua";
export type TranslationKey =
  | "gallery"
  | "mirror"
  | "about"
  | "contact"
  | "cart"
  | "yourCart"
  | "emptyCart"
  | "openCart"
  | "viewCartCheckout"
  | "addToCart";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    gallery: "The Gallery",
    mirror: "The Mirror",
    about: "About",
    contact: "Contact",
    cart: "Cart",
    yourCart: "Your cart",
    emptyCart: "Your cart is waiting for a fragrance.",
    openCart: "Open your cart",
    viewCartCheckout: "View cart & checkout",
    addToCart: "Add to Cart",
  },
  ru: {
    gallery: "Галерея",
    mirror: "Зеркало",
    about: "О нас",
    contact: "Контакты",
    cart: "Корзина",
    yourCart: "Ваша корзина",
    emptyCart: "Ваша корзина ждёт аромат.",
    openCart: "Открыть корзину",
    viewCartCheckout: "Корзина и оформление",
    addToCart: "Добавить в корзину",
  },
  ua: {
    gallery: "Галерея",
    mirror: "Дзеркало",
    about: "Про нас",
    contact: "Контакти",
    cart: "Кошик",
    yourCart: "Ваш кошик",
    emptyCart: "Ваш кошик чекає на аромат.",
    openCart: "Відкрити кошик",
    viewCartCheckout: "Кошик та оформлення",
    addToCart: "Додати до кошика",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "nuit-lumiere-language";

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "ru" || stored === "ua" || stored === "en" ? stored : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch {
      // Language selection remains available for this session if storage is unavailable.
    }
  }

  useEffect(() => {
    document.documentElement.lang = language === "ua" ? "uk" : language;
  }, [language]);

  const t = (key: TranslationKey) => translations[language][key];
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
