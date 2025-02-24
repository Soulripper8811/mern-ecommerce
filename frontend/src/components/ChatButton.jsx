import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../lib/axios";

const ChatButton = ({ products, userId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const messageListRef = useRef(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleChatToggle = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;

    const newMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");

    try {
      const response = await axiosInstance.post("/chatbot", {
        messages: [...messages, newMessage],
        products: products,
        userId: userId,
      });

      setMessages((prev) => [...prev, response.data.aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! There seems to be an issue. Please try again later.",
        },
      ]);
    }
  };

  const renderMessageContent = (message) => {
    const { content } = message;
    if (content && content.includes("http://localhost:5173/product/")) {
      const parts = content.split("http://localhost:5173/product/");
      if (parts.length >= 2) {
        const productId = parts[1].split(" ")[0].trim();
        const product = products.find((p) => p._id === productId); // Use _id

        if (product) {
          return (
            <div
              className="border p-4 rounded-md shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() =>
                window.open(
                  `http://localhost:5173/product/${productId}`,
                  "_blank"
                )
              }
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
              )}
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-blue-500 font-medium mt-1">View Product</p>
            </div>
          );
        }
      }
    }
    return <p>{content}</p>;
  };

  return (
    <div>
      <button
        className="fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg z-50 flex items-center justify-center"
        onClick={handleChatToggle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {isChatOpen && (
        <div className="fixed bottom-20 right-5 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-[400px] w-[350px] z-50 flex flex-col">
          <div
            ref={messageListRef}
            className="flex-grow overflow-y-auto space-y-2 mb-2"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-green-400 self-end text-white"
                    : "bg-gray-600 self-start text-white"
                }`}
              >
                <span className="font-semibold">
                  {msg.role === "user" ? "You:" : "Bot:"}
                </span>{" "}
                {renderMessageContent(msg)}
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300 text-black"
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-green-400 hover:bg-green-600 text-white rounded-md p-2"
            >
              Send
            </button>
          </div>
          <button
            onClick={handleChatToggle}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white rounded-md p-2"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatButton;
