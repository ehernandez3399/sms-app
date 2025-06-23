import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch businesses on mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/businesses`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch businesses');
        const data = await res.json();
        setBusinesses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="p-4">Loading businesses…</div>;
  if (error)   return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Businesses</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      {businesses.length === 0 ? (
        <div>
          <p className="mb-4">No businesses found.</p>
          <Link
            to="/businesses/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create a Business
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {businesses.map((biz) => (
            <li
              key={biz._id}
              className="flex justify-between items-center p-4 border rounded shadow-sm"
            >
              <div>
                <h2 className="text-xl font-semibold">{biz.name}</h2>
                <p className="text-sm text-gray-600">Timezone: {biz.timeZone}</p>
              </div>
              <Link
                to={`/businesses/${biz._id}/customers`}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Manage Customers
              </Link>
              <Link
                to={`/businesses/${biz._id}/jobs/new`}
                className="ml-2 bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                >
                New Campaign
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
