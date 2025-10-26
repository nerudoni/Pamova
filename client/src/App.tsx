import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Projects from "./pages/projects";
import Navbar from "./components/navbar";
import Login from "./pages/login";
import Settings from "./pages/settings";
import Dashboard from "./pages/dashboard";
import Manage from "./pages/manage";
import CreateProject from "./pages/createProject";
import ProjectPage from "./pages/projectpage";
import VerifyOTP from "./pages/verifyOTP";
import ResetPassword from "./pages/resetPassword";
import ManagePage from "./pages/managePage";
import TimelinePage from "./pages/TimelinePage";
import Notes from "./pages/notes";
import ActivityLog from "./pages/activityLog";

function App() {
  return (
    <>
      <Navbar />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/createProject" element={<CreateProject />} />
          <Route path="/projects/:id" element={<ProjectPage />} />
          <Route path="/verify" element={<VerifyOTP />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/manage/:id" element={<ManagePage />} />
          <Route path="/timeline/:id" element={<TimelinePage />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/activityLog" element={<ActivityLog />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
