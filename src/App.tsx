import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import AuthProvider from "./contexts/AuthContext";
import { ToastProvider } from "./providers/ToastProvider";
import { UpdateNotification } from "./components/pwa/UpdateNotification";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import JourneyMapPage from "./pages/JourneyMapPage";
import StatsPage from "./pages/StatsPage";
import TrainingPage from "./pages/TrainingPage";
import TeamPage from "./pages/TeamPage";
import AchievementsPage from "./pages/AchievementsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import TroubleshootingPage from "./pages/TroubleshootingPage";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter data-oid="95kcggy">
    <ThemeProvider defaultTheme="system" data-oid="hzuc_42">
      <QueryClientProvider client={queryClient} data-oid="y9691vs">
        <AuthProvider data-oid="adnw5w5">
          <ToastProvider>
            <Routes data-oid="o51gw4x">
              <Route
                path="/login"
                element={<Login data-oid=":_w7fid" />}
                data-oid="zdbyw9m"
              />

              <Route
                element={
                  <ProtectedRoute data-oid=":-1yc4x">
                    <Layout data-oid="9xpzisx" />
                  </ProtectedRoute>
                }
                data-oid="5nmnq4j"
              >
                <Route
                  path="/"
                  element={<Index data-oid="op4drti" />}
                  data-oid="w-ehpzx"
                />

                <Route
                  path="/journey"
                  element={<JourneyMapPage data-oid="9zx_rgx" />}
                  data-oid="xw7yy35"
                />

                <Route
                  path="/stats"
                  element={<StatsPage data-oid="y8lj3je" />}
                  data-oid="3glkruk"
                />

                <Route
                  path="/training"
                  element={<TrainingPage data-oid="0xgcnm8" />}
                  data-oid="hbmvugf"
                />

                <Route
                  path="/team"
                  element={<TeamPage data-oid="119rb1b" />}
                  data-oid="vh-ze3."
                />

                <Route
                  path="/achievements"
                  element={<AchievementsPage data-oid=":wgwhuc" />}
                  data-oid="6z-j9:v"
                />

                <Route
                  path="/profile"
                  element={<ProfilePage data-oid="7n-ra1l" />}
                  data-oid="bew3n2l"
                />

                <Route
                  path="/settings"
                  element={<SettingsPage data-oid="aaeh_bh" />}
                  data-oid="36r-8r4"
                />

                <Route
                  path="/troubleshooting"
                  element={<TroubleshootingPage data-oid="troubleshooting" />}
                  data-oid="troubleshooting"
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin" data-oid="khh6y3q">
                      <Admin data-oid="b.q5xi0" />
                    </ProtectedRoute>
                  }
                  data-oid="3idnu6_"
                />
              </Route>
              <Route
                path="*"
                element={<NotFound data-oid="93d-7oj" />}
                data-oid="g6ep3jx"
              />
            </Routes>
            <UpdateNotification data-oid="pih:ltn" />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;