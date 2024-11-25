const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
    {
        name: 'home-hero.jpg',
        url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&q=80',
        description: 'Luxury jewelry showcase'
    },
    {
        name: 'featured-1.jpg',
        url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1920&q=80',
        description: 'Elegant necklace'
    },
    {
        name: 'featured-2.jpg',
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80',
        description: 'Diamond rings'
    },
    {
        name: 'featured-3.jpg',
        url: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=1920&q=80',
        description: 'Luxury watch'
    },
    {
        name: 'collection-1.jpg',
        url: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=1920&q=80',
        description: 'Luxury earrings'
    },
    {
        name: 'collection-2.jpg',
        url: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=1920&q=80',
        description: 'Diamond collection'
    },
    {
        name: 'collection-3.jpg',
        url: 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=1920&q=80',
        description: 'Bracelets'
    },
    {
        name: 'testimonial-bg.jpg',
        url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1920&q=80',
        description: 'Luxury background'
    }
];

const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        const targetPath = path.join(__dirname, '..', 'public', 'images', filename);
        const file = fs.createWriteStream(targetPath);

        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', err => {
            fs.unlink(targetPath, () => {
                console.error(`Error downloading ${filename}:`, err.message);
                reject(err);
            });
        });
    });
};

async function downloadAllImages() {
    try {
        const downloads = images.map(img => downloadImage(img.url, img.name));
        await Promise.all(downloads);
        console.log('All images downloaded successfully!');
    } catch (error) {
        console.error('Error downloading images:', error);
    }
}

downloadAllImages();
