import { useState } from "react";

function Contact() {
  const [message, setMessage] = useState("");
  const [showHint, setShowHint] = useState(true);

  return (
    <section className="page-section">
      <h2>Contact Me</h2>
      <p>Send me a message and I will get back to you soon.</p>

      <label htmlFor="message" style={{ display: "block", marginTop: "16px", fontWeight: "bold" }}>
        Your message
      </label>
      <textarea
        id="message"
        rows="5"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        style={{ width: "100%", maxWidth: "480px", marginTop: "8px", padding: "10px" }}
      />

      <p style={{ marginTop: "8px", color: "#666" }}>
        Character count: {message.length}
      </p>

      <button
        type="button"
        onClick={() => setShowHint((prev) => !prev)}
        style={{ marginTop: "12px", padding: "8px 12px" }}
      >
        {showHint ? "Hide tip" : "Show tip"}
      </button>

      {showHint && (
        <p style={{ marginTop: "10px", color: "#007bff" }}>
          Tip: Use a short and clear subject line for better responses.
        </p>
      )}
    </section>
  );
}

export default Contact;
