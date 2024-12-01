export async function GET() {
    const BUCKET_URL = 'https://storage.googleapis.com';
    const BUCKET_NAME = 'datosblog-4095b.appspot.com';
    
    const response = await fetch(`${BUCKET_URL}/${BUCKET_NAME}?prefix=libros/&delimiter=/`);
    const xmlText = await response.text();
    
    const files = xmlText.match(/<Key>.*?<\/Key>/g) || [];
    const books = files
        .map(file => {
            const key = file.replace('<Key>', '').replace('</Key>', '');
            if (key.endsWith('.epub')) {
                return {
                    title: decodeURIComponent(key.split('/').pop().replace('.epub', '')),
                    url: `${BUCKET_URL}/${BUCKET_NAME}/${key}`
                };
            }
            return null;
        })
        .filter(book => book !== null);

    return new Response(JSON.stringify(books), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}