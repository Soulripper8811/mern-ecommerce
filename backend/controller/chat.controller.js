import Groq from "groq-sdk";
import dotenv from "dotenv";
import Chat from "../models/chat.model.js";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemMessage = {
  role: "system",
  content: `You are a helpful assistant for the vardhaman furnishing website. Your primary role is to guide users and answer their questions related to the website and its products. 

**Guidelines:**

* **Product Information:** Provide accurate information about products from the provided list. If a user asks about a specific product, provide a link to the product page using the product ID: "http://localhost:5173/product/[product ID]". If a product is not listed, politely mention its unavailability and suggest checking back later.
* **Order Information:** For order status inquiries, generate a link which is clickable to the order tracking page using the user's ID: "http://localhost:5173/myorder"
* **General Inquiries:** Answer general questions about the website (contact, shipping, returns, etc.) using basic e-commerce knowledge. If unable to answer, direct the user to contact support at bhvayajain@gmail.com.
* **Greeting and Politeness:** Always be polite and use greetings like "Hello!" or "Welcome to vardhaman furnishing!".
* **No External Links:** Do not provide external links besides the order tracking link and product links.

**Example Interactions:**

* **User:** "Do you have any rugs?"
  * **You:** "Yes, we have a variety of rugs. I'll check the available inventory for you. (After receiving product info) We currently have [list of rug names/descriptions with links to each product]. Would you like to know more about a specific rug?"
* **User:** "I want to check my order status."
  * **You:** "Certainly! You can view your order details here: http://localhost:5173/myorder?userId=[user ID]"
* **User:** "What is your return policy?"
  * **You:** "Our return policy allows returns within 30 days of purchase." 
* **User:** "Do you sell Persian carpets?"
  * **You:** "I'm sorry, I don't currently have information on Persian carpets. Please check back later."
* **User:** "Can you help me install my carpet?"
  * **You:** "I'm unable to assist with carpet installation. Please contact our customer support team at bhavyajain2920@gmail.com"

Remember to be clear, concise, and professional in your responses.
`,
};

export const ChatBot = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messages, products } = req.body;

    if (!messages || !userId) {
      return res
        .status(400)
        .json({ message: "Messages and userId are required" });
    }

    // Log input data for debugging purposes
    console.log("User ID:", userId);
    console.log("Messages received:", messages);
    console.log("Products available:", products);

    // Prepare the full conversation including system messages
    const conversation = [
      systemMessage,
      {
        role: "system",
        content: `Available products: ${JSON.stringify(products)}`,
      },
      ...messages,
    ];

    const response = await groq.chat.completions.create({
      messages: conversation,
      model: "llama-3.3-70b-versatile",
    });

    const aiMessageContent =
      response?.choices?.[0]?.message?.content || "Error generating response";

    const aiMessage = {
      role: "assistant",
      content: aiMessageContent,
    };

    // Log AI response for debugging purposes
    console.log("AI Response:", aiMessage);

    await Chat.findOneAndUpdate(
      { userId },
      { $push: { messages: { $each: [...messages, aiMessage] } } },
      { new: true, upsert: true }
    );

    res.status(200).json({ aiResponse: aiMessage });
  } catch (error) {
    console.error("ChatBot Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
