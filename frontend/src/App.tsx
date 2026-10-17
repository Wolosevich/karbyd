import { Routes, Route, Navigate } from "react-router-dom";
import { Center, Loader, AppShell } from "@mantine/core";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import { useAuth } from "./hooks/useAuth";
import PostDetail from "./pages/PostDetail";
import Search from "./pages/Search";
import Users from "./pages/Users";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
