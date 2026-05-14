export const getImageDataUrl = (base64) => {
    if (!base64 || typeof base64 !== 'string') return null;

    const cleaned = base64.trim();
    if (cleaned.startsWith('data:image/')) return cleaned;

    let mime = 'image/jpeg';
    if (cleaned.startsWith('iVBORw0KGgo')) {
        mime = 'image/png';
    } else if (cleaned.startsWith('UklGR')) {
        mime = 'image/webp';
    } else if (cleaned.startsWith('/9j/')) {
        mime = 'image/jpeg';
    }

    return `data:${mime};base64,${cleaned}`;
};
