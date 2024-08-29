const Groq = require('groq-sdk');

const randomKey = "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";
const groq = new Groq({ apiKey: randomKey });

let chatHistories = {};

const handleChat = async (req, res, systemMessage) => {
    const userId = req.query.user;
    const prompt = req.query.text;
    systemMessage = systemMessage || req.query.systemPrompt;
    const aiMessage = req.query.aiMessage;

    const sendRequest = async (sliceLength) => {
        try {
            const messages = chatHistories[userId].slice(-sliceLength);
            const payload = {
                messages: [
                    { role: "system", content: systemMessage },
                    ...messages.map(msg => ({ role: msg.role, content: msg.content })),
                    { role: "user", content: prompt },
                    aiMessage ? { role: "system", content: aiMessage } : null
                ].filter(Boolean)
            };

            const response = await groq.chat.completions.create({
                messages: payload.messages,
                model: "llama3-70b-8192",
                temperature: 1,
                max_tokens: 500,
                top_p: 1,
                stream: false,
                stop: null
            });

            const assistantMessage = { role: "assistant", content: response.choices[0].message.content.trim() };
            chatHistories[userId].push({ role: "user", content: prompt }, assistantMessage);

            // Batasi panjang history agar tidak terlalu besar
            if (chatHistories[userId].length > 20) {
                chatHistories[userId] = chatHistories[userId].slice(-20);
            }

            assistantMessage.content = assistantMessage.content.replace(/\n\n/g, '\n    ');
            assistantMessage.content = assistantMessage.content.replace(/\*\*/g, '*');

            res.json({ result: assistantMessage.content });
            return true;
        } catch (error) {
            return false;
        }
    };

    try {
        if (!chatHistories[userId]) {
            chatHistories[userId] = [];
        }

        let success = await sendRequest(20);
        if (!success) success = await sendRequest(15);
        if (!success) success = await sendRequest(10);
        if (!success) success = await sendRequest(5);
        if (!success) {
            chatHistories[userId] = [];
            success = await sendRequest(0);
        }
        if (!success) throw new Error('All retries failed');
    } catch (error) {
        chatHistories[userId] = [];
        console.error('Error request:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { handleChat, groq };
