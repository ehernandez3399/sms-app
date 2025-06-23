import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
  const { businessId } = useParams();
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    phoneNumber: '',
    email: '',
    firstName: '',
    lastName: '',
    tags: ''
  });

  // Fetch customers
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/businesses/${businessId}/customers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to load customers');
        setCustomers(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [businessId, token]);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = async e => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        businessId,
        phoneNumber: form.phoneNumber,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/businesses/${businessId}/customers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error('Failed to add customer');
      const newCust = await res.json();
      setCustomers(prev => [...prev, newCust]);
      setForm({ phoneNumber: '', email: '', firstName: '', lastName: '', tags: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/businesses/${businessId}/customers/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!res.ok) throw new Error('Delete failed');
      setCustomers(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = customers.filter(c =>
    [c.firstName, c.lastName, c.email, c.phoneNumber]
      .filter(Boolean)
      .some(field =>
        field.toLowerCase().includes(search.toLowerCase())
      )
  );

  if (loading) return <div className="p-6">Loading customers…</div>;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="space-x-2">
          <Link
            to="/businesses"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Businesses
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded flex-grow"
        />
        <Link
          to={`/businesses/${businessId}/customers/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Customer
        </Link>
      </div>

      <ul className="space-y-2">
        {filtered.map(cust => (
          <li
            key={cust._id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {cust.firstName} {cust.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {cust.phoneNumber || cust.email}
              </p>
              {cust.tags?.length > 0 && (
                <p className="text-xs text-gray-500">
                  Tags: {cust.tags.join(', ')}
                </p>
              )}
            </div>
            <div className="space-x-4">
              <Link
                to={`/businesses/${businessId}/customers/${cust._id}/edit`}
                className="text-blue-600 hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(cust._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-gray-500">No customers match your search.</li>
        )}
      </ul>

      {/* Add Customer Form */}
      <section className="max-w-md">
        <h2 className="text-xl font-semibold mb-2">Add New Customer</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="Phone number"
            className="w-full border p-2 rounded"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border p-2 rounded"
          />
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First name"
            className="w-full border p-2 rounded"
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last name"
            className="w-full border p-2 rounded"
          />
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="Tags (comma-separated)"
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add Customer
          </button>
        </form>
      </section>
    </div>
  );
};

export default Customers;
