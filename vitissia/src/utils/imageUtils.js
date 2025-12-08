// util/imageUtils.js
export function convertToJpegSameSize(file, quality = 0.92) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error('Échec conversion JPEG'));
                    const jpegFile = new File(
                        [blob],
                        file.name.replace(/\.\w+$/, '.jpg'),
                        { type: 'image/jpeg' }
                    );
                    resolve(jpegFile);
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
