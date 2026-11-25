import { useCallback, useEffect, useState } from "react";
import { COPY, type Lang } from "../data/i18n";

const KEY = "zrwlx3-lang";

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return localStorage.getItem(KEY) === "fr" ? "fr" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { lang, setLang, copy: COPY[lang] };
}
