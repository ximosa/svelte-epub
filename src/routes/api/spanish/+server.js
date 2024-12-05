import { json } from '@sveltejs/kit';

export const GET = async ({ url }) => {
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = 40;
    const offset = (page - 1) * limit;
    
    // Modificamos la URL para buscar solo libros con acceso completo
    const API_URL = `https://openlibrary.org/search.json?q=literatura+española&language=spa&has_fulltext=true&availability=open&limit=${limit}&offset=${offset}`;
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const items = await Promise.all(data.docs
            .filter(book => book.language?.includes('spa') && book.ia && book.public_scan_b)
            .map(async book => {
                const iaId = book.ia[0];
                const metadataUrl = `https://archive.org/metadata/${iaId}`;
                try {
                    const metadataResponse = await fetch(metadataUrl);
                    const metadata = await metadataResponse.json();
                    
                    const files = metadata.files || [];
                    const pdfFile = files.find(f => f.name.endsWith('.pdf') && f.size > 1000000);
                    const epubFile = files.find(f => f.name.endsWith('.epub'));
                    
                    return {
                        title: book.title,
                        author: book.author_name?.[0] || 'Autor desconocido',
                        year: book.first_publish_year || 'Año desconocido',
                        cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
                        ia: iaId,
                        readUrl: `https://archive.org/details/${iaId}?view=theater`,
                        downloadPdf: pdfFile ? `https://archive.org/download/${iaId}/${pdfFile.name}` : null,
                        downloadEpub: epubFile ? `https://archive.org/download/${iaId}/${epubFile.name}` : null
                    };
                } catch {
                    return null;
                }
            }));

        return json({ 
            items: items.filter(item => item && (item.downloadPdf || item.downloadEpub)),
            hasMore: data.numFound > offset + limit
        });
    } catch (error) {
        return json({ items: [], hasMore: false });
    }
};






