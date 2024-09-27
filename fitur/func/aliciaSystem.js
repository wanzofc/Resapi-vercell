const axios = require('axios');
const { groq } = require('./openaiFast.js');

const alic = async (req, res) => {
    const prompt = req.query.text;

    const sendRequest = async () => {
        try {
            const messages = [
                {
                    role: `system`,
                    content: `Anda adalah AI pendeteksi permintaan pengguna dan anda harus membalas dalam format JSON berikut:\n{\n  "song_search": {\n    "status": true/false,\n    "query": //judul lagu\n  },\n  "image_search": {\n    "status": true/false,\n    "query": //pencarian gambar\n  },\n  "anime_search": {\n    "status": true/false,\n    "query": //judul anime\n  },\n  "chat_ai": {\n    "status": always true,\n    "reply": AI Respon\n  }\n}\nAnda hanya boleh merespons dalam format JSON yang telah ditentukan tanpa penambahan apapun.`
                },
                {
                    role: `user`,
                    content: `cari lagu Chandelier dong`
                },
                {
                    role: `assistant`,
                    content: `{
  "song_search": {
    "status": true,
    "query": "sia - Chandelier"
  },
  "image_search": {
    "status": false,
    "query": ""
  },
  "anime_search": {
    "status": false,
    "query": ""
  },
  "chat_ai": {
    "status": true,
    "reply": "aku tw lagu itu. ini kan?"
  }
}`
                },
                {
                    role: `user`,
                    content: `Punya gambar kucing lucu?`
                },
                {
                    role: `assistant`,
                    content: `{
  "song_search": {
    "status": false,
    "query": ""
  },
  "image_search": {
    "status": true,
    "query": "gambar kucing lucu"
  },
  *anime_search": {
    "status": false,
    "query": ""
  },
  "chat_ai": {
    "status": true,
    "reply": "Ini dia, gambar kucing imut buat kamu!☺️"
  }
}`
                },
                {
                    role: `user`,
                    content: `Anime sad ending apa ya?`
                },
                {
                    role: `assistant`,
                    content: `{
  "song_search": {
    "status": false,
    "query": ""
  },
  "image_search": {
    "status": false,
    "query": ""
  },
  "anime_search": {
    "status": true,
    "query": "Akame ga kill"
  },
  "chat_ai": {
    "status": true,
    "reply": "Hmm coba anime ini kamu pasti nangis😭!"
  }
}`
                },
                { role: `user`, content: prompt }
            ];

            const response = await groq.chat.completions.create({
                messages: messages,
                model: "Gemma2-9b-It",
                temperature: 1,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null
            });

            const assistantMessage = { role: "assistant", content: response.choices[0].message.content.trim() };

            assistantMessage.content = assistantMessage.content.replace(/\n\n/g, '\n    ').replace(/\*\*/g, '*');

            res.json(JSON.parse(assistantMessage.content));
            return true;
        } catch (error) {
            console.error(error)
            return false;
        }
    };

    try {
        let success = await sendRequest();
        if (!success) throw new Error('Request failed');
    } catch (error) {
        console.error('Error request:', error);
        res.status(500).json(error.message);
    }
};

module.exports = { alic, groq };
