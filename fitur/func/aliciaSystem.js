const axios = require('axios');
const { groq } = require('./openaiFast.js');

const alic = async (req, res) => {
    const prompt = req.query.text;

    const sendRequest = async () => {
        try {
            const messages = [
                {
                    role: `system`,
                    content: `Anda adalah AI pendeteksi permintaan pengguna dan anda harus membalas dalam format JSON berikut:\n{\n  "song_search": {\n    "status": true/false,\n    "query": //judul lagu\n  },\n  "anime_search": {\n    "status": true/false,\n    "query": //judul anime\n  },\n  "character_search": {\n    "status": true/false,\n    "query": //nama karakter\n  },\n  "google_search": {\n    "status": true/false,\n    "query": //pencarian Google\n  },\n  "chat_ai": {\n    "status": always true,\n    "reply": AI Respon\n  }\n}\nAnda hanya boleh merespons dalam format JSON yang telah ditentukan tanpa penambahan apapun.`
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
    "query": "Sia - Chandelier"
  },
  "anime_search": {
    "status": false,
    "query": ""
  },
  "character_search": {
    "status": false,
    "query": ""
  },
  "google_search": {
    "status": false,
    "query": ""
  },
  "chat_ai": {
    "status": true,
    "reply": "Ini lagunya!"
  }
}`
                },
                {
                    role: `user`,
                    content: `Siapa karakter terkuat di Jujutsu Kaisen?`
                },
                {
                    role: `assistant`,
                    content: `{
  "song_search": {
    "status": false,
    "query": ""
  },
  "anime_search": {
    "status": false,
    "query": ""
  },
  "character_search": {
    "status": true,
    "query": "Gojo Satoru"
  },
  "google_search": {
    "status": false,
    "query": ""
  },
  "chat_ai": {
    "status": true,
    "reply": "Gojo Satoru adalah karakter terkuat di Jujutsu Kaisen!"
  }
}`
                },
                {
                    role: `user`,
                    content: `Anime dengan MC overpower apa ya?`
                },
                {
                    role: `assistant`,
                    content: `{
  "song_search": {
    "status": false,
    "query": ""
  },
  "anime_search": {
    "status": true,
    "query": "One Punch Man"
  },
  "character_search": {
    "status": false,
    "query": ""
  },
  "google_search": {
    "status": true,
    "query": "Anime dengan MC op"
  },
  "chat_ai": {
    "status": true,
    "reply": "One Punch Man mungkin bisa jadi pilihan!"
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
            console.error(error);
            return false;
        }
    };

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            let success = await sendRequest();
            if (success) break;
        } catch (error) {
            console.error('Error attempt:', attempt, error);
            if (attempt === 2) {
                res.status(500).json({ error: 'Request failed after 3 attempts' });
            }
        }
    }
};

module.exports = { alic, groq };
