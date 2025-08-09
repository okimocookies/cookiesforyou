import fetch from 'node-fetch';

export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const getSpotifyAccessToken = async () => {
        const authResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(spotifyClientId + ":" + spotifyClientSecret).toString("base64"),
            },
            body: "grant_type=client_credentials",
        });
        const data = await authResponse.json();
        return data.access_token;
    };

    const query = request.query.query;
    if (!query) {
        return response.status(400).send("Query parameter is required.");
    }

    try {
        const accessToken = await getSpotifyAccessToken();
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;

        const searchResponse = await fetch(searchUrl, {
            headers: { "Authorization": `Bearer ${accessToken}` },
        });

        if (!searchResponse.ok) {
            throw new Error(`Spotify API error: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        return response.status(200).json(searchData);

    } catch (error) {
        console.error("Error searching Spotify:", error);
        return response.status(500).send("Internal Server Error");
    }
}