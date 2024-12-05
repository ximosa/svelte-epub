export const load = async ({ fetch }) => {
    const response = await fetch('/api/spanish?page=1');
    const data = await response.json();
    
    return {
        books: data.items,
        hasMore: data.hasMore
    };
};