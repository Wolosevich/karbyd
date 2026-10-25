import { Link } from "react-router-dom";
import type { ReactNode } from "react";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const MENTION_REGEX = /(?<!\w)@([a-zA-Z0-9_]+)/g;

export function renderTextWithLinks(text: string): ReactNode[] {
  // Находим все совпадения: и ссылки, и упоминания
  const urlMatches = Array.from(text.matchAll(URL_REGEX));
  const mentionMatches = Array.from(text.matchAll(MENTION_REGEX));

  // Объединяем их и сортируем по порядку появления в тексте
  const matches = [...urlMatches, ...mentionMatches].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  );

  const result: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    const index = match.index ?? 0;
    const matchText = match[0];

    // Добавляем обычный текст, который шел ДО совпадения
    if (index > lastIndex) {
      result.push(
        <span key={`text-${lastIndex}`}>{text.slice(lastIndex, index)}</span>,
      );
    }

    // Если это ссылка
    if (matchText.startsWith("http")) {
      result.push(
        <a
          key={`url-${index}`}
          href={matchText}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--mantine-color-blue-4)",
            textDecoration: "underline",
          }}
        >
          {matchText}
        </a>,
      );
    }
    // Если это упоминание (начинается с @)
    else if (matchText.startsWith("@")) {
      const username = matchText.slice(1); // Убираем @ для ссылки
      result.push(
        <Link
          key={`mention-${index}`}
          to={`/profile/${username}`}
          style={{
            color: "var(--mantine-color-blue-4)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          {matchText}
        </Link>,
      );
    }

    lastIndex = index + matchText.length;
  }

  // Добавляем остаток текста после последнего совпадения
  if (lastIndex < text.length) {
    result.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return result;
}
