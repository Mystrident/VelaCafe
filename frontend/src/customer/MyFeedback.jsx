import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";

const formatDate = (value) =>
  new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

function MyFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedbacks = async () => {
      const customerToken = localStorage.getItem("customerToken");
      if (!customerToken) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await api.get("/api/feedback/mine", {
          headers: { Authorization: `Bearer ${customerToken}` },
        });
        setFeedbacks(response.data);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          localStorage.removeItem("customerToken");
          window.dispatchEvent(new Event("customer-auth-changed"));
          navigate("/", { replace: true });
          return;
        }
        setError(
          requestError.response?.data?.message ||
            "We couldn't load your feedback. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-cafe-bg pb-20 text-cafe-text">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pt-32 md:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-cafe-muted transition-colors hover:text-orange-500"
        >
          <HiArrowLeft className="text-lg" /> Back to menu
        </Link>
        <div className="mb-10 mt-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            My Feedback
          </h1>
          <p className="mt-3 font-medium text-cafe-muted">
            Follow up on your feedback and read replies from Velaa Cafe.
          </p>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="rounded-[2rem] border border-cafe-border bg-cafe-surface p-8 text-center">
            <p className="font-bold text-cafe-text">{error}</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="rounded-[2rem] border border-cafe-border bg-cafe-surface p-12 text-center">
            <span className="text-5xl">💬</span>
            <h2 className="mt-4 text-2xl font-black">No feedback yet</h2>
            <p className="mt-2 text-cafe-muted">
              Share your experience from the feedback section on the home page.
            </p>
            <Link
              to="/#feedback"
              className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
            >
              Share feedback
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {feedbacks.map((entry) => (
              <article
                key={entry._id}
                className="rounded-[2rem] border border-cafe-border bg-cafe-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-7"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-cafe-muted">
                    Submitted {formatDate(entry.createdAt)}
                  </p>
                  <span
                    className={`w-fit rounded-xl px-3 py-1.5 text-xs font-black ${
                      entry.adminReply
                        ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                        : "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300"
                    }`}
                  >
                    {entry.adminReply ? "Reply received" : "Awaiting reply"}
                  </span>
                </div>
                <div className="mt-5 rounded-2xl border border-cafe-border bg-cafe-elevated p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-cafe-muted">
                    Your feedback
                  </p>
                  <p className="mt-2 whitespace-pre-wrap font-medium leading-relaxed text-cafe-text">
                    {entry.feedback}
                  </p>
                </div>
                {entry.adminReply ? (
                  <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-5 dark:border-orange-900/40 dark:bg-orange-950/30">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-300">
                        Velaa Cafe reply
                      </p>
                      {entry.repliedAt && (
                        <p className="text-xs font-semibold text-orange-500/70 dark:text-orange-300/70">
                          {formatDate(entry.repliedAt)}
                        </p>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap font-medium leading-relaxed text-cafe-text">
                      {entry.adminReply}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 px-1 text-sm font-medium text-cafe-muted">
                    The cafe team has received your feedback and will reply here.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyFeedback;
