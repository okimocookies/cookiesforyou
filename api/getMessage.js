import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    const { id } = request.query;

    if (!id) {
        return response.status(400).json({ message: 'Message ID is required.' });
    }

    try {
        const query = `
            SELECT id, recipient AS to, content AS message, song_id, cookie_id, song_info
            FROM messages
            WHERE id = $1;
        `;
        
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return response.status(404).json({ message: 'Message not found.' });
        }
        
        const message = result.rows[0];
        message.songInfo = typeof message.song_info === 'string' ? JSON.parse(message.song_info) : message.song_info;

        return response.status(200).json(message);
    } catch (error) {
        console.error('Error fetching message:', error);
        return response.status(500).json({ message: "Error fetching message" });
    }
}