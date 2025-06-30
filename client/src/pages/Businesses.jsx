// client/src/pages/Businesses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Businesses() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/businesses`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to load businesses');
        setBusinesses(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <div className="p-6">Loading businesses…</div>;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Businesses</h1>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>

      <ul className="space-y-4">
    {businesses.map(b => (
      <li key={b._id} className="border p-4 rounded flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{b.name}</h2>
          <p className="text-sm text-gray-600">Timezone: {b.timeZone}</p>
        </div>

        <div className="space-x-4 text-right">
          <Link
            to={`/businesses/${b._id}/edit`}
            className="text-indigo-600 hover:underline"
          >
            Edit
          </Link><br />
          <Link
            to={`/businesses/${b._id}/customers`}
            className="text-blue-600 hover:underline"
          >
            Customers
          </Link><br />
          <Link
            to={`/businesses/${b._id}/campaigns`}
            className="text-blue-600 hover:underline"
          >
            Campaigns
          </Link><br />
        </div>
      </li>
    ))}
  </ul>
    </div>
  );
}
