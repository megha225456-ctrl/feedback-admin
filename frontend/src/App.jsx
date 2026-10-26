
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api/feedback";

function App() {
  const [feedback, setFeedback] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    courseName: "",
    courseDuration: "",
    comments: "",
    rating: "5",
  });

  async function loadFeedback() {
    try {
      const response = await axios.get(API);
      setFeedback(response.data);
    } catch (error) {
      console.error("Could not load feedback:", error);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

 
async function handleSubmit(event) {
  event.preventDefault();

  const data = {
    ...form,
    courseId: editingId
      ? feedback.find((item) => item._id === editingId)?.courseId
      : "CRS-" + Date.now().toString().slice(-6),
    rating: Number(form.rating),
  };

  try {
    if (editingId) {
      await axios.put(`${API}/${editingId}`, data);
    } else {
      await axios.post(API, data);
    }

    setForm({
      courseName: "",
      courseDuration: "",
      comments: "",
      rating: "5",
    });

    setEditingId(null);
    await loadFeedback();
    setPage("dashboard");
  } catch (error) {
    console.error("Could not save feedback:", error);
    alert(
      error.response?.data?.message ||
      error.message ||
      "Unknown error while saving feedback"
    );
  }
}


function handleEdit(item) {
  setEditingId(item._id);

  setForm({
    courseName: item.courseName,
    courseDuration: item.courseDuration,
    comments: item.comments,
    rating: String(item.rating),
  });

  setPage("add");
}
async function handleDelete(id) {
  if (!window.confirm("Are you sure you want to delete this feedback?")) {
    return;
  }

  try {
    await axios.delete(`${API}/${id}`);
    await loadFeedback();
  } catch (error) {
    console.error("Delete failed:", error);
    alert(error.response?.data?.message || error.message);
  }
}
  const averageRating = feedback.length
    ? (
        feedback.reduce((total, item) => total + item.rating, 0) /
        feedback.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">F</span>
          <div>
            <h2>FeedSpace</h2>
            <p>Feedback Management</p>
          </div>
        </div>

        <nav>
          <button
            className={page === "dashboard" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={page === "add" ? "nav-link active" : "nav-link"}
            onClick={() => {
              setEditingId(null);
              setForm({
                courseName: "",
                courseDuration: "",
                comments: "",
                rating: "5",
              });
              setPage("add");
            }}
          >
            + Add Feedback
          </button>
        </nav>
      </header>

      <main className="main-content">
        {page === "dashboard" ? (
          <>
            <div className="page-heading">
              <div>
                <p className="eyebrow">OVERVIEW</p>
                <h1>Feedback Dashboard</h1>
                <p className="subtitle">
                  Track course feedback and learner satisfaction.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    courseName: "",
                    courseDuration: "",
                    comments: "",
                    rating: "5",
                  });
                  setPage("add");
                }}
              >
                + New Feedback
              </button>
            </div>

            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon purple">▤</span>
                <p>Total Feedback</p>
                <h2>{feedback.length}</h2>
                <small>Responses recorded</small>
              </div>
              <div className="stat-card">
                <span className="stat-icon yellow">★</span>
                <p>Overall Rating</p>
                <h2>{averageRating} <span>/ 5</span></h2>
                <small>Average course rating</small>
              </div>
              <div className="stat-card">
                <span className="stat-icon green">✓</span>
                <p>Courses Reviewed</p>
                <h2>{new Set(feedback.map((item) => item.courseName)).size}</h2>
                <small>Unique courses</small>
              </div>
            </section>

            <section className="table-card">
              <div className="table-heading">
                <div>
                  <h2>Course Feedback</h2>
                  <p>Review and manage submitted responses.</p>
                </div>
                <button className="refresh-button" onClick={loadFeedback}>
                  ↻ Refresh
                </button>
              </div>

              {feedback.length === 0 ? (
                <div className="empty-state">
                  <span>▤</span>
                  <h3>No feedback yet</h3>
                  <p>Add your first course feedback to get started.</p>
                  <button className="primary-button" onClick={() => setPage("add")}>
                    Add Feedback
                  </button>
                </div>
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>COURSE ID</th>
                        <th>COURSE NAME</th>
                        <th>DURATION</th>
                        <th>COMMENTS</th>
                        <th>RATING</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.map((item) => (
                        <tr key={item._id}>
                          <td><span className="course-id">{item.courseId}</span></td>
                          <td className="course-name">{item.courseName}</td>
                          <td>{item.courseDuration}</td>
                          <td>{item.comments}</td>
                          <td><span className="rating">★ {item.rating}/5</span></td>
                          <td>
                            <div className="actions">
                              <button className="edit-button" onClick={() => handleEdit(item)}>
                                Edit
                              </button>
                              <button className="delete-button" onClick={() => handleDelete(item._id)}>
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
            </section>
          </>
        ) : (
          <section className="form-card">
            <button className="back-button" onClick={() => setPage("dashboard")}>
              ← Back to Dashboard
            </button>
            <p className="eyebrow">{editingId ? "UPDATE RESPONSE" : "NEW RESPONSE"}</p>
            <h1>{editingId ? "Edit Feedback" : "Add Course Feedback"}</h1>
            <p className="subtitle">
              Share your thoughts to help improve the learning experience.
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="courseName">Course Name</label>
              <input
                id="courseName"
                name="courseName"
                value={form.courseName}
                onChange={handleChange}
                placeholder="e.g. Introduction to Java"
                required
              />

              <label htmlFor="courseDuration">Course Duration</label>
              <input
                id="courseDuration"
                name="courseDuration"
                value={form.courseDuration}
                onChange={handleChange}
                placeholder="e.g. 6 weeks"
                required
              />

              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                name="comments"
                value={form.comments}
                onChange={handleChange}
                placeholder="What did you think about this course?"
                rows="4"
                required
              />

              <label htmlFor="rating">Rating</label>
              <select
                id="rating"
                name="rating"
                value={form.rating}
                onChange={handleChange}
                required
              >
                <option value="5">★★★★★ — Excellent</option>
                <option value="4">★★★★ — Very Good</option>
                <option value="3">★★★ — Good</option>
                <option value="2">★★ — Fair</option>
                <option value="1">★ — Needs Improvement</option>
              </select>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setPage("dashboard")}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editingId ? "Save Changes" : "Submit Feedback"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      <footer>FeedSpace · Course Feedback Management</footer>
    </div>
  );
}

export default App;
