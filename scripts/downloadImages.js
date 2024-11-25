const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
    {
        name: 'jewelry-hero.jpg',
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80',
        description: 'Elegant diamond rings'
    },
    {
        name: 'jewelry-crafting.jpg',
        url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1920&q=80',
        description: 'Jeweler working on a piece'
    },
    {
        name: 'craftsmanship.jpg',
        url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1920&q=80',
        description: 'Detailed jewelry work'
    },
    {
        name: 'design-process.jpg',
        url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&q=80',
        description: 'Design sketches and tools'
    },
    {
        name: 'materials.jpg',
        url: 'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=1920&q=80',
        description: 'Precious gems and materials'
    },
    {
        name: 'innovation.jpg',
        url: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1920&q=80',
        description: 'Modern jewelry design'
    },
    {
        name: 'design-submission.jpg',
        url: 'https://images.unsplash.com/photo-1616252993439-7e1924e5c29b?w=1920&q=80',
        description: 'Jewelry design sketches'
    },
    {
        name: 'designer-matching.jpg',
        url: 'https://images.unsplash.com/photo-1458909760068-747c6a78b77d?w=1920&q=80',
        description: 'Designer workspace'
    },
    {
        name: 'collaboration.jpg',
        url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&q=80',
        description: 'Designer-client interaction'
    },
    {
        name: 'creation.jpg',
        url: 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=1920&q=80',
        description: 'Final jewelry piece'
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
