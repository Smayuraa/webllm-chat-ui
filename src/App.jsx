import { useEffect, useState } from "react";
import * as webllm from "@mlc-ai/web-llm";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    { role: "system", content: "hey, how I can assist you today?" },
    { role: "user", content: "hey" },
    { role: "tool", content: "bye" },
    { role: "user", content: "by" },
  ]);

  const [input, setInput] = useState("");
  const [engine, setEngine] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";
    webllm
      .CreateMLCEngine(selectedModel, {
        initProgressCallback: (initProgress) => {
          console.log("initProgress", initProgress);
        },
      })
      .then((engine) => {
        setEngine(engine);
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

      const text=reply.choices[0].message.content

      tempMessages.push({
        role:"assistant",
        content:text
      })
      setMessages(tempMessages)

      console.log("reply", reply);
      setMessages([...updatedMessages, { role: "system", content: reply.message.content }]);
    } catch (error) {
      console.error("Error in getting reply:", error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const container = document.querySelector(".messages");
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <>
      <section>
        <div className="conversation-area">
          {!engine && <p className="loading-msg">Loading model...</p>}
          <div className="messages">
            {messages.filter(message=>message.role!=='system').map((msg, index) => (
              <div className={`message ${msg.role}`} key={index}>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              type="text"
              placeholder="message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessageToLlm()}
            />
            <button onClick={sendMessageToLlm}>
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;