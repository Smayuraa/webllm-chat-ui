import { useEffect, useState } from "react";
import * as webllm from "@mlc-ai/web-llm";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Hey! How can I assist you today?" }
  ]);

  const [input, setInput] = useState("");
  const [engine, setEngine] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const selectedModel = "Llama-3-8B-Instruct-q4f16_1-MLC"; 
    webllm
      .CreateMLCEngine(selectedModel, {
        initProgressCallback: (initProgress) => {
          console.log("initProgress", initProgress);
        },
      })
      .then((engine) => {
        setEngine(engine);
      })
      .catch((err) => {
        console.error("Model initialization failed:", err);
      });
  }, []);

  const sendMessageToLlm = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await engine.chat.completions.create({
        messages: updatedMessages,
      });

      console.log("reply", reply);
      setMessages([...updatedMessages, { role: "system", content: reply.message.content }]);
    } catch (error) {
      console.error("Error in getting reply:", error);
      setMessages([...updatedMessages, { role: "system", content: "Oops! Something went wrong." }]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const container = document.querySelector(".messages");
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <section>
      <div className="conversation-area">
        {!engine && <p className="loading-msg">Loading model...</p>}
        <div className="messages">
          {messages.map((msg, index) => (
            <div className={`message ${msg.role}`} key={index}>
              {msg.content}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessageToLlm()}
          />
          <button onClick={sendMessageToLlm} disabled={isLoading || !engine}>
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default App;
