import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo: accept any username/password, set admin
    if (username && password) {
      localStorage.setItem('SARU_AUTH', 'true');
      localStorage.setItem('SARU_ADMIN', 'true');
      setError('');
      if (onLogin) onLogin();
    } else {
      setError('Username and password required.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xs mx-auto bg-white p-6 rounded-lg shadow-md mt-12">
      <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="w-full mb-3 px-3 py-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded"
      />
      <button type="submit" className="w-full bg-[#2563EB] text-white py-2 rounded font-semibold">Login</button>
    </form>
  );
};

export default Login; 