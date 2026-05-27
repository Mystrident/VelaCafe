import { useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function Login() {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/admin/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);

      navigate("/admin");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
