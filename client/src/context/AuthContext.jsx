import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // -------- MOCK ACCOUNTS --------
  const accounts = {
    superadmin: {
      username: "superadmin",
      firstName: "Cardo",
      lastName: "Dalisay",
      password: "12345",
      phoneNumber: "12345678911",
      sex: "male",
      email: "cardodalisay@mail.com",
      address: "Tondo Manila",
      role: "super-admin",
    },
    admin: {
      username: "admin",
      firstName: "Justin",
      lastName: "Bieber",
      password: "12345",
      phoneNumber: "12345678911",
      sex: "male",
      email: "justinbeiber@mail.com",
      address: "York New",
      role: "admin",
    },
  };

  // -------- PERSISTENCE (load from localStorage) --------
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username, password) => {
    setError("");

    // -------- MOCK LOGIN --------
    const account = Object.values(accounts).find(
      (acc) => acc.username === username && acc.password === password
    );

    if (account) {
      setUser(account);
      localStorage.setItem("user", JSON.stringify(account)); // persist user

      // Role-based navigation
      if (account.role === "super-admin") {
        navigate("/super-admin");
      } else if (account.role === "admin") {
        navigate("/admin");
      }
    } else {
      setError("Invalid username or password");
    }

    // -------- REAL API LOGIN (replace later) --------
    // -------- Import axios first ----------
    // import axios from "axios"; <--- add this above
    /*
    try {
      const response = await axios.post("http://localhost:8000/api/login/", {
        username,
        password,
      });

      const data = response.data;

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user)); // persist user

      if (data.user.role === "super-admin") {
        navigate("/super-admin");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      setError("Invalid username or password");
      console.error("Login error:", err);
    }
    */
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // clear persistence
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth context
export const useAuth = () => useContext(AuthContext);
