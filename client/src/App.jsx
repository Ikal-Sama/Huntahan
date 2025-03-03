import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Loading from "./components/Loading";
import OtherProfile from "./pages/OtherProfile";

export default function App() {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  console.log("Online Users:", onlineUsers);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log(authUser);

  if (isCheckingAuth && !authUser) return <Loading />;

  return (
    <div className=''>
      <Navbar />
      <Routes>
        <Route
          path='/'
          element={authUser ? <HomePage /> : <Navigate to='/login' />}
        />
        <Route
          path='/signup'
          element={!authUser ? <SignUpPage /> : <Navigate to='/' />}
        />
        <Route
          path='/login'
          element={!authUser ? <LoginPage /> : <Navigate to='/' />}
        />
        <Route path='/settings' element={<SettingsPage />} />
        <Route
          path='/profile'
          element={authUser ? <ProfilePage /> : <Navigate to='/login' />}
        />

        <Route
          path='/user-profile/:id'
          element={authUser ? <OtherProfile /> : <Navigate to='/login' />}
        />
      </Routes>
      <Toaster />
    </div>
  );
}
