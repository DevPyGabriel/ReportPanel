import React, { useState } from "react";

/**
 * Componente de Login para autenticación segura.
 * Incluye configuración inicial de contraseña y verificación en cada sesión.
 * Usa hashing SHA-256 para proteger la contraseña.
 */
const Login = ({ onLogin }) => {
  // Estado para la contraseña ingresada en login
  const [password, setPassword] = useState("");
  // Estado para mensajes de error
  const [error, setError] = useState("");
  // Estado para verificar si es la primera vez (sin contraseña configurada)
  const [isFirstTime, setIsFirstTime] = useState(() => !localStorage.getItem("password_hash"));
  // Estados para configuración inicial
  const [configPassword, setConfigPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /**
   * Función para hashear la contraseña usando Web Crypto API.
   * @param {string} pwd - La contraseña a hashear.
   * @returns {Promise<string>} - El hash en formato hexadecimal.
   */
  const hashPassword = async (pwd) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  /**
   * Maneja el envío del formulario de configuración inicial.
   * Valida y guarda el hash de la contraseña.
   */
  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    if (configPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (configPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const hash = await hashPassword(configPassword);
    localStorage.setItem("password_hash", hash);
    setIsFirstTime(false);
    setError("");
    // Iniciar sesión después de configurar
    sessionStorage.setItem("session_active", "true");
    onLogin(true);
  };

  /**
   * Maneja el envío del formulario de login.
   * Verifica el hash de la contraseña ingresada contra el almacenado.
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const storedHash = localStorage.getItem("password_hash");
    if (!storedHash) {
      setError("No hay contraseña configurada.");
      return;
    }
    const inputHash = await hashPassword(password);
    if (inputHash === storedHash) {
      sessionStorage.setItem("session_active", "true");
      onLogin(true); // Notifica autenticación exitosa
    } else {
      setError("Contraseña incorrecta. Acceso denegado.");
    }
  };

  // Si es la primera vez, muestra formulario de configuración
  if (isFirstTime) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f4f4f4",
        }}
      >
        <form
          onSubmit={handleConfigSubmit}
          style={{
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "#333" }}>
            Configurar Contraseña Inicial
          </h2>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Nueva Contraseña:
            </label>
            <input
              type="password"
              value={configPassword}
              onChange={(e) => setConfigPassword(e.target.value)}
              style={{
                padding: "8px",
                width: "200px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Confirmar Contraseña:
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                padding: "8px",
                width: "200px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Configurar
          </button>
        </form>
      </div>
    );
  }

  // Formulario de login normal
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f4f4",
      }}
    >
      <form
        onSubmit={handleLoginSubmit}
        style={{
          padding: "30px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          Acceso al Panel de Vaciado
        </h2>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Introduce la Contraseña:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "8px",
              width: "200px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Ingresar al Sistema
        </button>
      </form>
    </div>
  );
};

export default Login;
