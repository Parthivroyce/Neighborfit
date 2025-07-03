import React, { useState, useEffect } from 'react';
import './index.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [form, setForm] = useState({
    budget: 3,
    commute_time: 2,
    noise_tolerance: 3,
    pet_friendly: true,
    green_spaces: true
  });

  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerMode, setRegisterMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
  }, [token]);

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          username: loginData.username,
          password: loginData.password
        })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      setToken(data.access_token);
      toast.success('Login successful!');
    } catch (err) {
      toast.error('Invalid credentials or login error.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });
      if (!res.ok) throw new Error("Registration failed");
      toast.success("Registration successful! Now log in.");
      setRegisterMode(false);
    } catch (err) {
      toast.error("Username may already exist or server error.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setResult([]);
    toast.success('Logged out');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult([]);

    try {
      const res = await fetch("http://127.0.0.1:8000/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResult(data.matches);
      data.matches.length === 0
        ? toast("No matching neighborhoods found.")
        : toast.success("Top matches loaded!");
    } catch (err) {
      toast.error("Error contacting backend. Check if it’s running.");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("NeighborFit Match Report", 14, 16);
    autoTable(doc, {
      head: [["Neighborhood", "Budget", "Commute", "Noise", "Pets", "Green", "Score"]],
      body: result.map(n => [
        n.name,
        n.budget,
        n.commute_time,
        n.noise_tolerance,
        n.pet_friendly ? "Yes" : "No",
        n.green_spaces ? "Yes" : "No",
        n.score
      ])
    });
    doc.save("NeighborFit_Matches.pdf");
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-blue-50 text-black'} min-h-screen flex flex-col items-center justify-center p-6`}>
      <Toaster position="top-right" />
      <button onClick={() => setDarkMode(!darkMode)} className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded">
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>

      <h1 className="text-3xl font-bold mb-4">🏘️ NeighborFit Matcher</h1>

      {!token ? (
        <form onSubmit={registerMode ? handleRegister : handleLogin} className="bg-white shadow-lg rounded-xl px-8 pt-6 pb-8 mb-6 w-full max-w-md space-y-4 border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-600">{registerMode ? "🆕 Register" : "🔐 Login"}</h2>
          <input type="text" name="username" placeholder="Username" value={loginData.username} onChange={handleAuthChange} className="w-full border rounded p-2" />
          <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleAuthChange} className="w-full border rounded p-2" />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
            {registerMode ? "Register" : "Login"}
          </button>
          <p className="text-sm text-center">
            {registerMode ? "Already have an account?" : "No account yet?"}{" "}
            <span onClick={() => setRegisterMode(!registerMode)} className="text-blue-600 cursor-pointer underline">
              {registerMode ? "Login here" : "Register here"}
            </span>
          </p>
        </form>
      ) : (
        <>
          <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-2 mb-4 rounded">🚪 Logout</button>

          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl px-8 pt-6 pb-8 mb-6 w-full max-w-xl space-y-6 border border-blue-100">
            <h2 className="text-2xl font-semibold text-blue-600">🎯 Match Your Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col text-sm font-medium">💰 Budget (1-5):
                <input name="budget" type="number" min="1" max="5" value={form.budget} onChange={handleChange} className="mt-1 p-2 border rounded-md" />
              </label>
              <label className="flex flex-col text-sm font-medium">🚌 Commute Time (1-5):
                <input name="commute_time" type="number" min="1" max="5" value={form.commute_time} onChange={handleChange} className="mt-1 p-2 border rounded-md" />
              </label>
              <label className="flex flex-col text-sm font-medium">🔊 Noise Tolerance (1-5):
                <input name="noise_tolerance" type="number" min="1" max="5" value={form.noise_tolerance} onChange={handleChange} className="mt-1 p-2 border rounded-md" />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input name="pet_friendly" type="checkbox" checked={form.pet_friendly} onChange={handleChange} className="accent-blue-600" /> 🐶 Pet Friendly
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input name="green_spaces" type="checkbox" checked={form.green_spaces} onChange={handleChange} className="accent-green-600" /> 🌳 Green Spaces
              </label>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow">
              {loading ? "Finding..." : "🔍 Find Match"}
            </button>
          </form>

          {result.length > 0 && (
            <div className="w-full max-w-4xl bg-white p-6 shadow rounded">
              <h2 className="text-xl font-bold mb-4 text-center">📊 Top Matches</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="budget" fill="#60A5FA" name="Budget" />
                  <Bar dataKey="commute_time" fill="#34D399" name="Commute Time" />
                  <Bar dataKey="noise_tolerance" fill="#FBBF24" name="Noise Tolerance" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold text-center">🐶 Pet Friendly Distribution</h3>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={[
                        { name: 'Yes', value: result.filter(n => n.pet_friendly).length },
                        { name: 'No', value: result.filter(n => !n.pet_friendly).length },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      label
                    >
                      <Cell fill="#34D399" />
                      <Cell fill="#F87171" />
                    </Pie>
                    <Legend />
                  </PieChart>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold text-center">🌳 Green Spaces Distribution</h3>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={[
                        { name: 'Yes', value: result.filter(n => n.green_spaces).length },
                        { name: 'No', value: result.filter(n => !n.green_spaces).length },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      label
                    >
                      <Cell fill="#60A5FA" />
                      <Cell fill="#FBBF24" />
                    </Pie>
                    <Legend />
                  </PieChart>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.map((n, i) => (
                  <div key={i} className="bg-gray-100 p-4 rounded shadow text-sm">
                    <h3 className="font-bold text-lg mb-2">🏡 {n.name}</h3>
                    <p>💰 Budget: {n.budget}</p>
                    <p>🚌 Commute Time: {n.commute_time}</p>
                    <p>🔊 Noise Tolerance: {n.noise_tolerance}</p>
                    <p>🐶 Pet Friendly: {n.pet_friendly ? "Yes" : "No"}</p>
                    <p>🌳 Green Spaces: {n.green_spaces ? "Yes" : "No"}</p>
                    <p>📈 Match Score: {n.score}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-4 justify-center">
                <CSVLink data={result} filename="NeighborFit_Matches.csv" className="bg-green-500 text-white px-4 py-2 rounded">📥 Export CSV</CSVLink>
                <button onClick={exportPDF} className="bg-red-500 text-white px-4 py-2 rounded">🧾 Export PDF</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
