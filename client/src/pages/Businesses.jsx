import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Businesses = () => {
  const { token, logout } = useAuth();
  const navigate           = useNavigate();

  const [businesses, setBusinesses]   = useState([]);
  const [loadingBiz, setLoadingBiz]   = useState(true);
  const [error, setError]             = useState('');

  // campaigns per businessId
  const [jobsMap, setJobsMap]         = useState({});
  const [loadingJobs, setLoadingJobs] = useState(false);

  // 1) Load businesses
  useEffect(() => {
    (async () => {
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
        setLoadingBiz(false);
      }
    })();
  }, [token]);

  // 2) Once businesses are loaded, fetch each one's campaigns
  useEffect(() => {
    if (loadingBiz) return;

    const fetchAllJobs = async () => {
      setLoadingJobs(true);
      const map = {};

      await Promise.all(
        businesses.map(async biz => {
          try {
            const res = await fetch(
              `${process.env.REACT_APP_API_URL}/businesses/${biz._id}/jobs`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            map[biz._id] = res.ok ? await res.json() : [];
          } catch {
            map[biz._id] = [];
          }
        })
      );

      setJobsMap(map);
      setLoadingJobs(false);
    };

    fetchAllJobs();
  }, [businesses, loadingBiz, token]);

  // 3) Create business form
  const [form, setForm] = useState({
    name: '', timeZone: 'UTC', defaultFromNumber: ''
  });
  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/businesses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        }
      );
      if (!res.ok) throw new Error('Failed to create business');
      const newBiz = await res.json();
      setBusinesses(prev => [...prev, newBiz]);
      setForm({ name: '', timeZone: 'UTC', defaultFromNumber: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loadingBiz) return <div className="p-6">Loading businesses…</div>;
  if (error)      return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Businesses</h1>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <ul className="space-y-6">
        {businesses.map(biz => (
          <li key={biz._id} className="p-4 border rounded space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{biz.name}</p>
                <p className="text-sm text-gray-600">
                  Timezone: {biz.timeZone}
                </p>
              </div>

              <div className="space-y-2 text-right">
                <Link
                  to={`/businesses/${biz._id}/customers`}
                  className="block bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Manage Customers
                </Link>
                <Link
                  to={`/businesses/${biz._id}/createcampaign`}
                  className="block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Add New Campaign
                </Link>
              </div>
            </div>

            {/* — Existing campaigns under each business — */}
            <div className="pl-4 border-l">
              <h3 className="font-semibold mb-1">Existing Campaigns</h3>
              {loadingJobs ? (
                <p>Loading campaigns…</p>
              ) : !jobsMap[biz._id] || jobsMap[biz._id].length === 0 ? (
                <p className="text-sm text-gray-600">No campaigns yet.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  {jobsMap[biz._id].map(job => (
                    <li key={job._id}>
                      <strong>
                        {job.type === 'one-time' ? 'One-Time' : 'Recurring'}
                      </strong>{' '}
                      — “{job.message}”
                      {job.nextRun && (
                        <> • next run: {new Date(job.nextRun).toLocaleString()}</>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>

      <section className="max-w-md">
        <h2 className="text-xl font-semibold mb-2">Add New Business</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Business name"
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="defaultFromNumber"
            value={form.defaultFromNumber}
            onChange={handleChange}
            placeholder="Default from number"
            className="w-full border p-2 rounded"
            required
          />
          <select
            name="timeZone"
            value={form.timeZone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="UTC">UTC</option>
            <option value="America/Chicago">America/Chicago</option>
            <option value="America/New_York">America/New_York</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Create Business
          </button>
        </form>
      </section>
    </div>
  );
};

export default Businesses;
