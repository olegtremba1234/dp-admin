import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import Categories from './pages/Categories';
import Documents from './pages/Documents';
import News from './pages/News';
import Tenders from './pages/Tenders';
import ContactSubmissions from './pages/ContactSubmissions';
import ListingRequests from './pages/ListingRequests';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/news" element={<News />} />
          <Route path="/tenders" element={<Tenders />} />
          <Route path="/contact-submissions" element={<ContactSubmissions />} />
          <Route path="/listing-requests" element={<ListingRequests />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
