import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Stack,
  Group,
  Avatar,
  Text,
  Paper,
  Loader,
  Center,
  Alert,
  ActionIcon,
  TextInput,
  Box,
  Title,
  Popover,
  FileButton,
} from '@mantine/core';
import {
  IconInfoCircle,
  IconArrowLeft,
  IconSend,
  IconMoodSmile,
  IconPaperclip,
  IconFile,
  IconDownload,
} from '@tabler/icons-react';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../hooks/useAuth';
import { useChat, useSendMessage } from '../hooks/useMessages';
import { useUploadFile } from '../hooks/useUploadFile';

// Вспомогательная функция для красивых дат
function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.floor((n.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Форматирование размера файла
function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

export default function Chat() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useChat(username || '');
  const sendMessage = useSendMessage(username || '');
  const { uploadFile, isUploading } = useUploadFile();

  const [text, setText] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    await sendMessage.mutateAsync({ text: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Обработка выбора файла
  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    const fileData = await uploadFile(file);
    if (fileData) {
      await sendMessage.mutateAsync({ text: '', file: fileData });
    }
  };

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" icon={<IconInfoCircle size={16} />} title="Ошибка">
          Не удалось загрузить чат
        </Alert>
      </Container>
    );
  }

  const { user, messages } = data;

  return (
    <Container size="sm" py="md">
      <Stack gap="md" style={{ height: 'calc(100vh - 100px)' }}>
        {/* Шапка чата */}
        <Paper withBorder p="sm" radius="md">
          <Group justify="space-between">
            <Group>
              <ActionIcon variant="subtle" onClick={() => navigate('/dialogs')}>
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Avatar
                src={user.avatar}
                radius="xl"
                component={Link}
                to={`/profile/${user.username}`}
              >
                {user.username[0].toUpperCase()}
              </Avatar>
              <Title order={4}>{user.username}</Title>
            </Group>
          </Group>
        </Paper>

        {/* Сообщения */}
        <Box
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {messages.length === 0 ? (
            <Text c="dimmed" ta="center" mt="xl">
              Начните разговор первым 👋
            </Text>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.senderId === currentUser?.id;
              const currentDate = new Date(msg.createdAt).toDateString();
              const prevDate =
                index > 0
                  ? new Date(messages[index - 1].createdAt).toDateString()
                  : null;
              const showDateDivider = currentDate !== prevDate;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                    gap: 4,
                  }}
                >
                  {showDateDivider && (
                    <div
                      style={{
                        textAlign: 'center',
                        width: '100%',
                        margin: '12px 0',
                      }}
                    >
                      <Text size="xs" c="dimmed" fw={500}>
                        {formatDateLabel(msg.createdAt)}
                      </Text>
                    </div>
                  )}

                  <Paper
                    p="sm"
                    radius="md"
                    style={{
                      maxWidth: '75%',
                      backgroundColor: isMine
                        ? 'var(--mantine-color-blue-6)'
                        : 'var(--mantine-color-dark-6)',
                      borderBottomRightRadius: isMine ? 4 : undefined,
                      borderBottomLeftRadius: !isMine ? 4 : undefined,
                    }}
                  >
                    {msg.text && (
                      <Text
                        size="sm"
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {msg.text}
                      </Text>
                    )}

                    {/* Отображение файла, если он есть */}
                    {msg.fileUrl && (
                      <Paper
                        withBorder
                        p="xs"
                        radius="sm"
                        mt={msg.text ? 'xs' : 0}
                        style={{
                          backgroundColor: isMine
                            ? 'var(--mantine-color-dark-5)'
                            : 'var(--mantine-color-dark-5)',
                        }}
                      >
                        <Group gap="xs" wrap="nowrap">
                          <IconFile size={20} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text size="sm" truncate c="white">
                              {msg.fileName}
                            </Text>
                            {msg.fileSize && (
                              <Text size="xs" c="dimmed">
                                {formatFileSize(msg.fileSize)}
                              </Text>
                            )}
                          </div>
                          <ActionIcon
                            component="a"
                            href={msg.fileUrl}
                            download={msg.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="subtle"
                            color="gray"
                          >
                            <IconDownload size={16} />
                          </ActionIcon>
                        </Group>
                      </Paper>
                    )}

                    <Text
                      size="10px"
                      c={isMine ? 'blue.1' : 'dimmed'}
                      ta="right"
                      mt={4}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Paper>
                </div>
              );
            })
          )}
        </Box>

        {/* Поле ввода */}
        <Group gap="xs" wrap="nowrap">
          <Popover
            opened={emojiPickerOpen}
            onChange={setEmojiPickerOpen}
            position="top-start"
            shadow="md"
          >
            <Popover.Target>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => setEmojiPickerOpen((o) => !o)}
              >
                <IconMoodSmile size={20} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown p={0}>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setText((prev) => prev + emojiData.emoji);
                  setEmojiPickerOpen(false);
                }}
              />
            </Popover.Dropdown>
          </Popover>

          {/* Кнопка загрузки файла */}
          <FileButton onChange={handleFileSelect}>
            {(props) => (
              <ActionIcon
                {...props}
                variant="subtle"
                size="lg"
                loading={isUploading}
              >
                <IconPaperclip size={20} />
              </ActionIcon>
            )}
          </FileButton>

          <TextInput
            placeholder="Введите сообщение..."
            style={{ flex: 1 }}
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
          <ActionIcon
            size="lg"
            variant="filled"
            onClick={handleSend}
            loading={sendMessage.isPending}
            disabled={!text.trim()}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </Stack>
    </Container>
  );
}