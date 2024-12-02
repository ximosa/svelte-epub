export async function GET({ url }) {
    const targetUrl = url.searchParams.get('url');
    const response = await fetch(targetUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    return new Response(arrayBuffer, {
        headers: {
            'Content-Type': 'application/epub+zip',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

