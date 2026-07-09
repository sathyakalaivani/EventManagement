import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import EventDetails from './pages/EventDetails.jsx';
import MyEvents from './pages/MyEvents.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateEvent from './pages/CreateEvent.jsx';
import EditEvent from './pages/EditEvent.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetails />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/my-events" element={<MyEvents />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/events/new" element={<CreateEvent />} />
            <Route path="/admin/events/:id/edit" element={<EditEvent />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
