import { Stack, Text, ThemeIcon, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Stack align="center" gap="xs" py="xl">
      <ThemeIcon size={64} radius={100} variant="light" color="gray">
        {icon}
      </ThemeIcon>
      <Title order={4} mt="sm" ta="center">
        {title}
      </Title>
      {description && (
        <Text c="dimmed" size="sm" ta="center" maw={300}>
          {description}
        </Text>
      )}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </Stack>
  );
}
