import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminNavbar from "../components/AdminNavbar";
import Loader from "../components/Loader";

const formatDate = (value) =>
  new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const response = await api.get("/api/feedback");
        setFeedbacks(response.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Couldn't load feedback. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-20">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#3a1710] tracking-tight">
              Feedbacks
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              See what customers think about their Velaa Café visit.
            </p>
          </div>
          {!loading && !error && (
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm text-sm font-bold text-[#3a1710]">
              {feedbacks.length} {feedbacks.length === 1 ? "response" : "responses"}
            </div>
          )}
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10 text-center">
            <p className="font-bold text-[#3a1710]">{error}</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-14 text-center">
            <p className="text-4xl mb-4">💬</p>
            <h2 className="text-2xl font-black text-[#3a1710]">No Feedback Yet</h2>
            <p className="text-gray-500 font-medium mt-2">
              Customer feedback will appear here after it is submitted.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {feedbacks.map((entry) => (
              <article
                key={entry._id}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-[#3a1710]">{entry.name}</h2>
                    <p className="text-sm font-bold text-orange-500 mt-1 break-all">
                      {entry.email}
                    </p>
                  </div>
                  <time className="text-xs font-semibold text-gray-400">
                    {formatDate(entry.createdAt)}
                  </time>
                </div>
                <p className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-5 text-[#3a1710] font-medium leading-relaxed whitespace-pre-wrap">
                  {entry.feedback}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Feedbacks;
