import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const emptyForm = {
  name: "",
  designer: "",
  details: "",
  status: "Submit",
  invoice: "",
  email: "",
  amount: "",
  payment: "Unpaid",
  due_date: "",
  priority: "Medium",
  drive_link: "",
};

const statusOptions = ["Submit", "In Progress", "Revision", "Completed"];
const paymentOptions = ["Unpaid", "Deposit Paid", "Fully Paid"];
const priorityOptions = ["Low", "Medium", "High"];

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Error load data: " + error.message);
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEdit(job) {
    setEditingId(job.id);
    setForm({
      name: job.name || "",
      designer: job.designer || "",
      details: job.details || "",
      status: job.status || "Submit",
      invoice: job.invoice || "",
      email: job.email || "",
      amount: job.amount ?? "",
      payment: job.payment || "Unpaid",
      due_date: job.due_date || "",
      priority: job.priority || "Medium",
      drive_link: job.drive_link || "",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("Edit dibatalkan.");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.designer || !form.invoice) {
      setMessage("Isi Name Job, Designer, dan Invoice dulu.");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      ...form,
      amount: Number(form.amount || 0),
      due_date: form.due_date || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("jobs")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setMessage("Error update data: " + error.message);
      } else {
        setMessage("Job berjaya diupdate.");
        setEditingId(null);
        setForm(emptyForm);
        await loadJobs();
      }
    } else {
      const { error } = await supabase.from("jobs").insert([payload]);

      if (error) {
        setMessage("Error simpan data: " + error.message);
      } else {
        setMessage("Job berjaya ditambah.");
        setForm(emptyForm);
        await loadJobs();
      }
    }

    setSaving(false);
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm("Delete job ni?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      setMessage("Error delete data: " + error.message);
    } else {
      setMessage("Job berjaya dipadam.");
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadJobs();
    }
  }

  async function handleStatusChange(id, value) {
    const { error } = await supabase
      .from("jobs")
      .update({ status: value })
      .eq("id", id);

    if (error) {
      setMessage("Error update status: " + error.message);
    } else {
      await loadJobs();
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const text = [
        job.name,
        job.designer,
        job.details,
        job.invoice,
        job.email,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [jobs, search]);

  const totalRevenue = jobs.reduce((sum, job) => sum + Number(job.amount || 0), 0);
  const totalCompleted = jobs.filter((job) => job.status === "Completed").length;
  const totalProgress = jobs.filter((job) => job.status === "In Progress").length;
  const totalRevision = jobs.filter((job) => job.status === "Revision").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(56,189,248,0.12), transparent 30%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        color: "#e2e8f0",
        padding: "24px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: "36px", color: "white", fontWeight: 800 }}>
          Mizxart Studio Dashboard
        </h1>
        <p style={{ color: "#94a3b8", marginTop: "8px" }}>
          Customize all your needs
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <StatCard label="Total Jobs" value={jobs.length} />
          <StatCard label="In Progress" value={totalProgress} />
          <StatCard label="Revision" value={totalRevision} />
          <StatCard label="Revenue" value={formatRM(totalRevenue)} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.35fr 0.95fr",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          <div style={panelStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ margin: 0, color: "white", fontSize: "30px" }}>Job List</h2>
              <input
                type="text"
                placeholder="Search job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />
            </div>

            {loading ? (
              <p>Loading data...</p>
            ) : filteredJobs.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>Belum ada job.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr style={{ color: "#94a3b8", textAlign: "left" }}>
                      <th style={thStyle}>Job</th>
                      <th style={thStyle}>Designer</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Payment</th>
                      <th style={thStyle}>Invoice</th>
                      <th style={thStyle}>RM</th>
                      <th style={thStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr
                        key={job.id}
                        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <td style={tdStyle}>
                          <div style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>
                            {job.name}
                          </div>
                          <div style={{ color: "#94a3b8", marginTop: "6px", lineHeight: 1.6 }}>
                            {job.details}
                          </div>

                          <div
                            style={{
                              marginTop: "8px",
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            {job.drive_link ? (
                              <a
                                href={job.drive_link}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: "#67e8f9",
                                  textDecoration: "none",
                                  fontSize: "12px",
                                  wordBreak: "break-all",
                                }}
                              >
                                Open Drive Link
                              </a>
                            ) : (
                              <span style={{ color: "#64748b", fontSize: "12px" }}>No Drive Link</span>
                            )}
                          </div>
                        </td>

                        <td style={tdStyle}>{job.designer}</td>

                        <td style={tdStyle}>
                          <div style={{ display: "grid", gap: "8px" }}>
                            <span style={getStatusBadgeStyle(job.status)}>
                              {job.status || "Submit"}
                            </span>
                            <select
                              value={job.status || "Submit"}
                              onChange={(e) => handleStatusChange(job.id, e.target.value)}
                              style={selectStyle}
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <span style={getPaymentBadgeStyle(job.payment)}>
                            {job.payment || "Unpaid"}
                          </span>
                        </td>

                        <td style={tdStyle}>{job.invoice}</td>
                        <td style={tdStyle}>{formatRM(job.amount)}</td>

                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button onClick={() => handleEdit(job)} style={editBtnStyle}>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(job.id)}
                              style={deleteBtnStyle}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={panelStyle}>
            <h2 style={{ marginTop: 0, color: "white", fontSize: "30px" }}>
              {editingId ? "Edit Job" : "Add New Job"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={formGrid}>
                <input
                  name="name"
                  placeholder="Name Job"
                  value={form.name}
                  onChange={handleChange}
                  style={inputStyle}
                />
                <input
                  name="designer"
                  placeholder="Designer"
                  value={form.designer}
                  onChange={handleChange}
                  style={inputStyle}
                />
                <textarea
                  name="details"
                  placeholder="Details"
                  value={form.details}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    minHeight: "100px",
                    resize: "vertical",
                    gridColumn: "1 / -1",
                  }}
                />
                <input
                  name="invoice"
                  placeholder="Invoice"
                  value={form.invoice}
                  onChange={handleChange}
                  style={inputStyle}
                />
                <input
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  style={inputStyle}
                />
                <input
                  name="amount"
                  placeholder="RM"
                  value={form.amount}
                  onChange={handleChange}
                  style={inputStyle}
                />
                <input
                  name="drive_link"
                  placeholder="Google Drive Link"
                  value={form.drive_link}
                  onChange={handleChange}
                  style={inputStyle}
                />
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  name="payment"
                  value={form.payment}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  {paymentOptions.map((payment) => (
                    <option key={payment} value={payment}>
                      {payment}
                    </option>
                  ))}
                </select>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: "16px",
                  width: "100%",
                  background: "white",
                  color: "#020617",
                  border: "none",
                  padding: "14px",
                  borderRadius: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                {saving ? "Saving..." : editingId ? "Update Job" : "Save New Job"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    background: "transparent",
                    color: "#e2e8f0",
                    border: "1px solid rgba(255,255,255,0.12)",
                    padding: "12px",
                    borderRadius: "14px",
                    cursor: "pointer",
                  }}
                >
                  Cancel Edit
                </button>
              ) : null}
            </form>

            {message ? (
              <p style={{ marginTop: "14px", color: "#fbbf24" }}>{message}</p>
            ) : null}

            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.04)",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              Completed jobs: <strong style={{ color: "white" }}>{totalCompleted}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <div style={{ color: "#94a3b8", fontSize: "14px" }}>{label}</div>
      <div
        style={{
          color: "white",
          fontSize: "34px",
          fontWeight: "bold",
          marginTop: "10px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatRM(value) {
  const amount = Number(value || 0);
  return "RM " + amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getStatusBadgeStyle(status) {
  const base = {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    border: "1px solid transparent",
    width: "fit-content",
  };

  if (status === "In Progress") {
    return {
      ...base,
      background: "rgba(59,130,246,0.15)",
      color: "#93c5fd",
      border: "1px solid rgba(59,130,246,0.3)",
    };
  }

  if (status === "Revision") {
    return {
      ...base,
      background: "rgba(245,158,11,0.15)",
      color: "#fcd34d",
      border: "1px solid rgba(245,158,11,0.3)",
    };
  }

  if (status === "Completed") {
    return {
      ...base,
      background: "rgba(16,185,129,0.15)",
      color: "#86efac",
      border: "1px solid rgba(16,185,129,0.3)",
    };
  }

  return {
    ...base,
    background: "rgba(148,163,184,0.12)",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,0.2)",
  };
}

function getPaymentBadgeStyle(payment) {
  const base = {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    border: "1px solid transparent",
  };

  if (payment === "Fully Paid") {
    return {
      ...base,
      background: "rgba(16,185,129,0.15)",
      color: "#86efac",
      border: "1px solid rgba(16,185,129,0.3)",
    };
  }

  if (payment === "Deposit Paid") {
    return {
      ...base,
      background: "rgba(168,85,247,0.15)",
      color: "#d8b4fe",
      border: "1px solid rgba(168,85,247,0.3)",
    };
  }

  return {
    ...base,
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,0.3)",
  };
}

const panelStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  padding: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
};

const statCardStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#0f172a",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
};

const editBtnStyle = {
  background: "#1d4ed8",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 600,
};

const deleteBtnStyle = {
  background: "#7f1d1d",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 600,
};

const thStyle = {
  padding: "12px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const tdStyle = {
  padding: "12px",
  verticalAlign: "top",
};