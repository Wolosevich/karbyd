import { Routes, Route, Navigate } from "react-router-dom";
import { Center, Loader, AppShell } from "@mantine/core";
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
import Dialogs from './pages/Dialogs';
import Chat from './pages/Chat';

function App() {
  const { user, isLoading } = useAuth();

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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Если ЗАЛОГИНЕН
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/users" element={<Users />} />
          <Route path="/search" element={<Search />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/dialogs" element={<Dialogs />} />
          <Route path="/chat/:username" element={<Chat />} />
          {/* Если залогиненный заходит на /login или /landing — кидаем на главную */}
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
