import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { IoSend, IoClose, IoChatbubbleEllipses } from "react-icons/io5";

const ChatButton = ({ products, userId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const messageListRef = useRef(null);
  const navigate = useNavigate(); // React Router navigation

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

    // Extract all product links from the message
    const matches = [...content.matchAll(/\/product\/(\w+)/g)];

    return (
      <div className="space-y-3">
        {/* Display the message text without the product links */}
        <p>
          {content.replace(/http:\/\/localhost:\d+\/product\/\w+/g, "").trim()}
        </p>

        {/* Display product cards if any */}
        {matches.map((match, index) => {
          const productId = match[1];
          const product = products.find((p) => p._id === productId);

          if (product) {
            return (
              <div
                key={index}
                className="border border-black p-3 rounded-lg shadow-md bg-white cursor-pointer hover:bg-gray-100 transition-transform transform hover:scale-105"
                onClick={() => navigate(`/product/${productId}`)}
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
          return null;
        })}
      </div>
    );
  };
  return (
    <div>
      {/* Floating Chat Button */}
      <button
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-transform transform hover:scale-105 z-[9999]"
        onClick={handleChatToggle}
      >
        <IoChatbubbleEllipses className="text-2xl" />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-20 right-5 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-[35rem] z-50 flex flex-col animate-slide-up">
          {/* Chat Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-700">
              Chat Assistant
            </h2>
            <button
              onClick={handleChatToggle}
              className="text-red-500 hover:text-red-600 text-xl"
            >
              <IoClose />
            </button>
          </div>

          {/* Chat Messages */}
          <div
            ref={messageListRef}
            className="flex-grow overflow-y-auto max-h-60 space-y-3 p-2"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg shadow ${
                  msg.role === "user"
                    ? "bg-green-500 text-white self-end"
                    : "bg-gray-200 text-gray-800 self-start"
                }`}
              >
                <span className="font-semibold">
                  {msg.role === "user" ? "You:" : "Bot:"}
                </span>{" "}
                {renderMessageContent(msg)}
              </div>
            ))}
          </div>

          {/* Input Field */}
          <div className="flex items-center border-t pt-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-green-400 text-black"
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-green-500 hover:bg-green-600 text-white rounded-md p-2 transition"
            >
              <IoSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;
