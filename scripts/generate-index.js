const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Read all video directories
const videosDir = path.join(__dirname, '../src/videos');
const videos = [];

if (fs.existsSync(videosDir)) {
    const videoFolders = fs.readdirSync(videosDir);
    
    videoFolders.forEach(folder => {
        const metaPath = path.join(videosDir, folder, 'meta.json');
        if (fs.existsSync(metaPath)) {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            meta.slug = folder;
            videos.push(meta);
        }
    });
}

// Sort videos by date (newest first)
videos.sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate individual video pages
const template = fs.readFileSync(path.join(__dirname, '../templates/video-template.html'), 'utf8');

videos.forEach(video => {
    const notesPath = path.join(videosDir, video.slug, 'notes.md');
    const videoDir = path.join(videosDir, video.slug);
    
    if (fs.existsSync(notesPath)) {
        const notesContent = fs.readFileSync(notesPath, 'utf8');
        const htmlContent = marked(notesContent);
        
    let youtubeEmbedUrl;
    if (video.youtube_url.includes('youtu.be/')) {
        youtubeEmbedUrl = video.youtube_url.replace('youtu.be/', 'www.youtube.com/embed/');
    } else {
        youtubeEmbedUrl = video.youtube_url.replace('watch?v=', 'embed/');
    }        
        let pageHtml = template
            .replace(/{{TITLE}}/g, video.title)
            .replace(/{{DATE}}/g, video.date)
            .replace(/{{DURATION}}/g, video.duration)
            .replace(/{{DESCRIPTION}}/g, video.description)
            .replace(/{{YOUTUBE_URL}}/g, video.youtube_url)
            .replace(/{{YOUTUBE_EMBED_URL}}/g, youtubeEmbedUrl)
            .replace(/{{NOTES_CONTENT}}/g, htmlContent);
        
        fs.writeFileSync(path.join(videoDir, 'index.html'), pageHtml);
    }
});

// Update main index.html with video data
const indexPath = path.join(__dirname, '../src/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const videosJson = JSON.stringify(videos, null, 8);
indexHtml = indexHtml.replace(/const videos = \[[\s\S]*?\];/, `const videos = ${videosJson};`);

fs.writeFileSync(indexPath, indexHtml);

console.log(`Generated ${videos.length} video pages`);
