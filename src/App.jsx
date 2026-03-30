import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#020617",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  return session ? <Dashboard session={session} /> : <Login />;
}