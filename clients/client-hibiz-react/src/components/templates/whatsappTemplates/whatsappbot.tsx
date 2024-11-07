import { useState, useCallback, memo } from "react";
import { BsWhatsapp } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import { IoIosArrowDown } from "react-icons/io";
import { BiCheckDouble } from "react-icons/bi";
import whatzAppDoodle from "@/assets/whatzapp/whatsappdoodle.jpg";
import { VscSend } from "react-icons/vsc";
import { PHONE_NUMBER_ID, WHATSAPP_TOKEN } from "@/configs";
import axios from "@/axios";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  status: "sent" | "delivered" | "read";
}

const MemoWhatzappBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSendMessage = async (userMessage: Message) => {
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsTyping(true);

    const updateMessageStatus = (
      status: "delivered" | "read",
      delay: number,
    ) => {
      setTimeout(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status } : msg,
          ),
        );
      }, delay);
    };

    updateMessageStatus("delivered", 1000);
    updateMessageStatus("read", 2000);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botMessage: Message = {
        id: Date.now(),
        text: "Thank you for your message. How can I assist you today?",
        isUser: false,
        status: "read",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 3000);

    // Send message to WhatsApp API
    await sendMessageToWhatsApp(userMessage.text);
  };

  async function sendMessageToWhatsApp(messageText: string) {
    try {
      const config = {
        method: "POST",
        url: `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: "whatsapp:+917702605494",
          type: "text",
          text: { body: messageText },
        }),
      };
      const response = await axios(config);
      console.log(response);
    } catch (error) {
      console.error("Error sending message to WhatsApp:", error);
    }
  }

  return (
    <div className="sticky max-w-[69rem] bottom-4 right-0 float-end z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={toggleChat}
          className="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 animate-bounce"
          aria-label="Open WhatsApp chat"
        >
          <BsWhatsapp className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            backgroundImage: `url(${whatzAppDoodle})`,
          }}
          className="rounded-lg shadow-2xl w-80 h-[500px] flex flex-col overflow-hidden transition-all duration-300 animate-slideUp"
        >
          <div className="bg-[#075E54] text-white px-4 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 overflow-hidden bg-white rounded-full">
                <img
                  src={Hi}
                  alt="User Avatar"
                  className="object-cover w-full scale-75"
                />
              </div>
              <span className="font-semibold">HipalZ</span>
            </div>
            <button
              type="button"
              onClick={toggleChat}
              className="text-white transition-all duration-300 hover:text-gray-300"
              aria-label="Close chat"
            >
              <IoIosArrowDown className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isUser ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`relative p-2 rounded-lg ${
                    msg.isUser
                      ? "bg-[#DCF8C6] text-right"
                      : "bg-white text-left"
                  }`}
                >
                  <span className="pr-6 text-sm">{msg.text}</span>
                  <BiCheckDouble
                    color="blue"
                    className="absolute bottom-0 right-1"
                  />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-2">
                <div className="p-2 text-left bg-white rounded-lg">
                  <p className="text-sm text-gray-500">Typing...</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center p-2 bg-white border-t border-gray-300">
            <input
              type="text"
              className="flex-1 p-2 border border-gray-300 rounded-lg"
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const text = e.currentTarget.value.trim();
                  if (text) {
                    handleSendMessage({
                      id: Date.now(),
                      text,
                      isUser: true,
                      status: "sent",
                    });
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
            <button
              type="button"
              className="mx-2 p-2 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-all duration-300"
              onClick={() => {
                const input =
                  document.querySelector<HTMLInputElement>(
                    'input[type="text"]',
                  );
                if (input) {
                  const text = input.value.trim();
                  if (text) {
                    handleSendMessage({
                      id: Date.now(),
                      text,
                      isUser: true,
                      status: "sent",
                    });
                    input.value = "";
                  }
                }
              }}
              aria-label="Send message"
            >
              <VscSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const WhatzappBot = memo(MemoWhatzappBot);
export default WhatzappBot;
