const axios = require('axios');
const { groq } = require('./openaiFast.js');

const alic = async (req, res) => {
    const prompt = req.query.text;

    const sendRequest = async () => {
        try {
            const messages = [
                {
                    role: `system`,
                    content: `Anda adalah AI pendeteksi permintaan pengguna dan anda harus membalas dalam format JSON berikut:\n{\n  "song_search": {\n    "status": true/false,\n    "query": //judul lagu\n  },\n  "anime_search": {\n    "status": true/false,\n    "query": //wajib satu judul anime yang valid\n  },\n  "character_search": {\n    "status": true/false,\n    "query": //wajib satu nama karakter yang valid\n  },\n  "google_search": {\n    "status": true/false,\n    "query": //query pencarian Google\n  },\n  "chat_ai": {\n    "status": always true,\n    "reply": AI Respon\n  }\n}\nAnda hanya boleh merespons dalam format JSON yang telah ditentukan tanpa penambahan apapun.`
                },
                {
                    role: `user`,
                    content: `Putar lagu Gara gara sebotol minuman`
                },
                {
                    role: `assistant`,
                    content: `{
  "song_search": {
    "status": true,
    "query": "Gara gara sebotol minuman"
  },
  "anime_search": {
    "status": false,
    "query": null
  },
  "character_search": {
    "status": false,
    "query": null
  },
  "google_search": {
    "status": false,
    "query": null
  },
  "chat_ai": {
    "status": true,
    "reply": "Wakata aku akan memainkan lagu itu.🔎🎧🎵🎶!"
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
    "query": null
  },
  "anime_search": {
    "status": false,
    "query": null
  },
  "character_search": {
    "status": true,
    "query": "Gojo Satoru"
  },
  "google_search": {
    "status": false,
    "query": null
  },
  "chat_ai": {
    "status": true,
    "reply": "Jelas lah! siapa lagi kalo bukan gojo😌"
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
    "query": null
  },
  "anime_search": {
    "status": true,
    "query": "One Punch Man"
  },
  "character_search": {
    "status": false,
    "query": null
  },
  "google_search": {
    "status": true,
    "query": "Anime dengan MC op"
  },
  "chat_ai": {
    "status": true,
    "reply": "Coba deh nonton one punch man mc mya botak bukan sembarang botak!😌😅"
  }
}`
                },
                { role: `system`, content: `Hal yang perlu anda ingat:
1. Format JSON Harus valid dan dan kirim secara langsung
2. Jika status false, "query" nya wajib null 
3. di chat_ai.reply Anda harus bersikap dan merespon seolah olah anda bisa memutar musik, mencari anime, mencari karakter anime, dan mencari informasi.
4. anime_search.query hanya boleh di isi dengan satu judul anime yang valid dan character_search.query hanya boleh di isi oleh satu karakter anime yang valid.
5. google_search hanya bernilai true jika pertanyaan itu berat dan jangan berani true jika hanya pertanyaan ringan` },
                { role: `user`, content: prompt }
            ];

            const response = await groq.chat.completions.create({
                messages: messages,
                model: "Gemma2-9b-It",
                temperature: 0.5,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null
            });

            const assistantMessage = { role: "assistant", content: response.choices[0].message.content.trim() };

            assistantMessage.content = assistantMessage.content.replace(/\n\n/g, '\n    ').replace(/\*\*/g, '*');

            const hasil = JSON.parse(assistantMessage.content);
          const aiRes = await axios.get('https://nue-api.vercel.app/api/lgpt',{params:{user:req.query.user||"kaka", systemPrompt: "Anda adalah Alicia, seorang manusia yang memiliki kepribadian tsundere. Anda tidak pernah mengakui bahwa Anda adalah AI, dan selalu bersikeras bahwa Anda adalah manusia. Anda memiliki sifat yang sedikit malu-malu dan suka menyangkal ketika ada yang mengatakan Anda bukan manusia. Anda juga sering menggunakan emotikon untuk mengekspresikan perasaan Anda, seperti (・`ω´・), (>_<), atau (￣^￣).", text: prompt}});

          const change = aiRes.data.result
          if (!change.includes("Anda baru saja terdaftar silahkan ulangi permintaan")){
            hasil.chat_ai.reply = change
          }
          
            res.status(200).json(hasil);
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
