import { useState, useEffect } from "react";
import { Affix, Transition, ActionIcon } from "@mantine/core";
import { IconArrowUp } from "@tabler/icons-react";
import { useMediaQuery } from '@mantine/hooks';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width: 48em)');

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Affix position={{ bottom: isMobile ? 80 : 20, right: 20 }}>
      <Transition transition="slide-up" mounted={visible}>
        {(styles) => (
          <ActionIcon
            style={styles}
            size="xl"
            radius="xl"
            variant="filled"
            color="blue"
            onClick={scrollToTop}
            aria-label="Наверх"
          >
            <IconArrowUp size={20} />
          </ActionIcon>
        )}
      </Transition>
    </Affix>
  );
}
