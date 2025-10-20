import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

export default function App() {
  const [userName, setUserName] = useState("Cargando...");
  const [moodleId, setMoodleId] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Leer parámetros de la URL al cargar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("sessionToken");
    const moodleUserId = params.get("moodleUserId");

    if (token) {
      localStorage.setItem("sessionToken", token);
    }

    if (moodleUserId) {
      localStorage.setItem("moodleUserId", moodleUserId);
      setMoodleId(moodleUserId);
      fetchUserName(moodleUserId);
    } else {
      setUserName("Usuario no identificado");
      setLoading(false);
    }
  }, []);

  // ✅ Obtener nombre del usuario desde NestJS
  const fetchUserName = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE}/moodle/${userId}`);
      setUserName(res.data.name || "Sin nombre");
    } catch (err) {
      console.error(err);
      setUserName("Error al cargar usuario");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Redirigir al backend para login OAuth
  const handleLogin = () => {
    window.location.href = `${API_BASE}/moodle/login`;
  };

  // ✅ Manejar selección de archivo
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ✅ Subir archivo usando token y moodleUserId
  const handleUpload = async () => {
    const token = localStorage.getItem("sessionToken");
    const userId = localStorage.getItem("moodleUserId");

    if (!token) {
      setMessage("⚠️ Debes iniciar sesión primero.");
      return;
    }
    if (!userId) {
      setMessage("⚠️ ID de Moodle no encontrado.");
      return;
    }
    if (!file) {
      setMessage("Selecciona un archivo primero.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentId", "1");
    formData.append("userId", userId);

    try {
      const res = await axios.post(`${API_BASE}/moodle/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(`✅ ${res.data.message}`);
    } catch (err) {
      console.error(err);
      setMessage(
        "❌ Error al subir archivo: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-2xl p-8 space-y-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600">
          Integración Moodle OAuth
        </h1>

        {loading ? (
          <p className="text-gray-500 animate-pulse">
            Cargando datos del usuario...
          </p>
        ) : (
          <>
            <p className="text-lg">
              Hola,{" "}
              <span className="font-semibold text-green-600">{userName}</span>
            </p>
            <p className="text-sm text-gray-600">
              ID de Moodle: {moodleId || "No disponible"}
            </p>

            <div className="mt-4">
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Iniciar sesión con Moodle
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <input type="file" onChange={handleFileChange} />
              <button
                onClick={handleUpload}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Subir archivo
              </button>
            </div>

            {message && <p className="mt-4 text-gray-700">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}
