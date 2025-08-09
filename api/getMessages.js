import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const query = `
            SELECT id, recipient AS to, content AS message, song_id, cookie_id, song_info
            FROM messages
            ORDER BY created_at DESC
            LIMIT 21;
        `;
        
        const result = await pool.query(query);
        const messages = result.rows.map(row => ({
            ...row,
            songInfo: typeof row.song_info === 'string' ? JSON.parse(row.song_info) : row.song_info
        }));

        return response.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return response.status(500).json({ message: "Error fetching messages" });
    }
}