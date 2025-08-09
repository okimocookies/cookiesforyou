import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

export default async function handler(request, response) {
    // FIX: Menambahkan header CORS untuk mengizinkan permintaan POST
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }
    
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    const { to, message, songId, cookieId, songInfo } = request.body;

    try {
        const query = `
            INSERT INTO messages (recipient, content, song_id, cookie_id, song_info) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id;
        `;
        const values = [to, message, songId, cookieId, JSON.stringify(songInfo)];
        
        const result = await pool.query(query, values);
        const newId = result.rows[0].id;

        return response.status(200).json({ id: newId });
    } catch (error) {
        console.error('Error saving message:', error);
        return response.status(500).json({ message: "Error saving message", details: error.message });
    }
}
