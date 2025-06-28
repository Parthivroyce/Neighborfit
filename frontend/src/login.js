// src/Login.js
import React, { useState } from 'react';

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username: form.username,
          password: form.password,
          grant_type: "password"
        })
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      onLogin();  // callback to show main dashboard
    } catch (err) {
      alert("Login failed. Check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <form onSubmit={handleLogin} className="bg-white shadow p-8 rounded space-y-4">
        <h1 className="text-xl font-bold text-center mb-4">🔐 Login to NeighborFit</h1>
        <input
          className="border px-3 py-2 w-full"
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <input
          className="border px-3 py-2 w-full"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <button type="submit" className="bg-blue-500 text-white w-full py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
