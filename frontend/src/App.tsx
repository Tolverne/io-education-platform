import { useEffect, useState } from "react";
import "./App.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking API...");

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus("API unavailable"));
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <h1>IO Education</h1>
        <p>Stylus-first digital workbooks for teachers and students.</p>

        <div className="card">
          <h2>API Status</h2>
          <p>{apiStatus}</p>
        </div>

        <div className="actions">
          <button>Teacher Sign In</button>
          <button className="secondary">Student Access</button>
        </div>
      </section>
    </main>
  );
}

export default App;