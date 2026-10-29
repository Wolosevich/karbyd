import { Routes, Route, Navigate } from "react-router-dom";
import Admin from './pages/Admin';
import {
  Center,
  Loader,
  Box,
  AppShell,
  useMantineColorScheme,
} from "@mantine/core";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Users from "./pages/Users";
import PostDetail from "./pages/PostDetail";
import Notifications from "./pages/Notifications";
import Navbar from "./components/Navbar";
import { useAuth } from "./hooks/useAuth";
import Dialogs from "./pages/Dialogs";
import Chat from "./pages/Chat";
import Saved from "./pages/Saved";
import MobileNavbar from "./components/MobileNavbar";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./hooks/useWebSocket";

function App() {
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const gradientBg = isDark
    ? "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)"
    : "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)";

  useWebSocket(token || undefined, (payload) => {
    if (payload.event === "new_notification") {
      // Обновляем кэш уведомлений, чтобы колокольчик загорелся
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  // Если НЕ залогинен
  if (!user) {
    return (
      <Box style={{ minHeight: "100vh", background: gradientBg }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    );
  }

  // Если ЗАЛОГИНЕН
  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <AppShell.Header
        style={{
          backgroundColor: isDark
            ? "rgba(30, 39, 50, 0.5)"
            : "rgba(255, 255, 255, 0.6)",
          /* backdropFilter: "blur(12px)",
           WebkitBackdropFilter: "blur(12px)",*/
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Navbar />
      </AppShell.Header>
      <AppShell.Main
        style={{
          paddingBottom: "60px",
          background: gradientBg,
          minHeight: "100vh",
          paddingTop: '60px'
        }}
      >
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/users" element={<Users />} />
          <Route path="/search" element={<Search />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/dialogs" element={<Dialogs />} />
          <Route path="/chat/:username" element={<Chat />} />
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <MobileNavbar />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
