import { Fragment } from "react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import "./LanguageSwitcher.css";

const options: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "ua", label: "UA" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher" role="group" aria-label="Choose language">
      {options.map((option, index) => (
        <Fragment key={option.code}>
          {index > 0 && <span className="language-separator" aria-hidden="true">|</span>}
          <button
            type="button"
            className="language-option"
            aria-pressed={language === option.code}
            onClick={() => setLanguage(option.code)}
          >
            {option.label}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
