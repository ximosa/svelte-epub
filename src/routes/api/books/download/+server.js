// src/routes/api/books/download/+server.js
export async function GET({ url }) {
    const targetUrl = url.searchParams.get('url');
    
    const response = await fetch(targetUrl);
    const blob = await response.blob();
    
    return new Response(blob, {
        headers: {
            'Content-Type': 'application/epub+zip',
            'Access-Control-Allow-Origin': '*'
        }
    });
}