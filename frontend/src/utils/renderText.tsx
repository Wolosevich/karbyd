import type { ReactNode } from "react";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function renderTextWithLinks(text: string): ReactNode[] {
  const parts = text.split(URL_REGEX);

  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      // Сбрасываем lastIndex у regex (важно при использовании test)
      URL_REGEX.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--mantine-color-blue-4)",
            textDecoration: "underline",
          }}
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
