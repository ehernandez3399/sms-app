// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token } = useAuth();
  const API = process.env.REACT_APP_API_URL;

  const [businesses, setBusinesses] = useState([]);
  const [campaigns, setCampaigns]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [bizRes, jobRes] = await Promise.all([
          fetch(`${API}/businesses`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API}/jobs`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        if (!bizRes.ok) throw new Error('Failed to load businesses');
        if (!jobRes.ok) throw new Error('Failed to load campaigns');

        const [bizList, jobList] = await Promise.all([
          bizRes.json(),
          jobRes.json()
        ]);

        setBusinesses(bizList);
        setCampaigns(jobList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [API, token]);

  if (loading) return <div className="p-6">Loading dashboard…</div>;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Businesses Panel */}
        <div className="p-4 bg-blue-50 rounded shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Businesses</h2>
            <Link
              to="/businesses/new"
              className="text-blue-600 hover:underline text-sm"
            >
              + Add
            </Link>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {businesses.length > 0 ? (
              businesses.map(b => (
                <li key={b._id}>
                  <Link
                    to={`/businesses/${b._id}`}
                    className="text-blue-800 hover:underline"
                  >
                    {b.name}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-gray-600">No businesses yet.</li>
            )}
          </ul>
        </div>

        {/* Campaigns Panel */}
        <div className="p-4 bg-purple-50 rounded shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Campaigns</h2>
            <Link
              to="/businesses"
              className="text-purple-600 hover:underline text-sm"
            >
              Manage
            </Link>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {campaigns.length > 0 ? (
              campaigns.map(j => (
                <li key={j._id}>
                  <Link
                    to={`/businesses/${j.businessId}/campaigns/${j._id}/edit`}
                    className="text-purple-800 hover:underline"
                  >
                    {j.type}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-gray-600">No campaigns yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
