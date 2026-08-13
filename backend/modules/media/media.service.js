const mediaRepository = require('./media.repository');
const fs = require('fs');
const path = require('path');
const ApiError = require('../../utils/ApiError');
const { imageSize: sizeOf } = require('image-size');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { getFullUrl } = require('../../utils/getFullUrl');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

class MediaService {

  async uploadFile(file) {
    if (!file) throw new ApiError(400, 'No file uploaded');

    const folder = file.mimetype.startsWith('image/') ? 'images' : 
                   file.mimetype.startsWith('video/') ? 'videos' : 'docs';

    const mediaData = {
      filename: file.filename,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      path: `/uploads/${folder}/${file.filename}`,
      alt_text: path.parse(file.originalname).name,
      caption: '',
      description: '',
      dimensions: null,
      thumbnail_url: null
    };

    const fullPath = path.join(__dirname, '../../', mediaData.path);

    // Extract Image Dimensions
    if (file.mimetype.startsWith('image/')) {
      try {
        const dimensions = sizeOf(fs.readFileSync(fullPath));
        mediaData.dimensions = `${dimensions.width}x${dimensions.height}`;
      } catch (err) {
        console.error('Error extracting image dimensions:', err);
      }
    }

    // Generate Video Thumbnail
    if (file.mimetype.startsWith('video/')) {
      try {
        const thumbName = `thumb-${Date.now()}.jpg`;
        const thumbFolder = path.join(__dirname, '../../uploads/images');
        
        await new Promise((resolve, reject) => {
          ffmpeg(fullPath)
            .screenshots({
              timestamps: [1],
              filename: thumbName,
              folder: thumbFolder,
              size: '640x?'
            })
            .on('end', resolve)
            .on('error', (err) => {
              console.error('FFmpeg error:', err);
              resolve(); // Don't fail the whole upload if thumbnail fails
            });
        });

        if (fs.existsSync(path.join(thumbFolder, thumbName))) {
          mediaData.thumbnail_url = `/uploads/images/${thumbName}`;
        }
      } catch (err) {
        console.error('Error generating video thumbnail:', err);
      }
    }

    const id = await mediaRepository.create(mediaData);
    
    return { 
      id, 
      ...mediaData,
    url: getFullUrl(mediaData.path),
    thumbnail_url: getFullUrl(mediaData.thumbnail_url)
    };
  }

  async uploadFiles(files) {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new ApiError(400, 'No files provided');
    }

    const uploadPromises = files.map(file => this.uploadFile(file));
    return await Promise.all(uploadPromises);
  }

  async getAllMedia() {
    const media = await mediaRepository.getAllMedia();
    return media.map(item => ({
      ...item,
    url: getFullUrl(item.path),
    thumbnail_url: getFullUrl(item.thumbnail_url)
    }));
  }

  async getMediaById(id) {
    const media = await mediaRepository.findById(id);
    if (!media) throw new ApiError(404, 'Media not found');
    return {
      ...media,
    url: getFullUrl(media.path),
    thumbnail_url: getFullUrl(media.thumbnail_url)
    };
  }

  async deleteMedia(id) {
    const media = await mediaRepository.findById(id);
    if (!media) throw new ApiError(404, 'Media not found');

    // Delete main file
    const filePath = path.join(__dirname, '../../', media.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete thumbnail if exists
    if (media.thumbnail_url) {
      const thumbPath = path.join(__dirname, '../../', media.thumbnail_url);
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    }

    await mediaRepository.delete(id);
    return true;
  }

  async updateMedia(id, data) {
    const media = await mediaRepository.findById(id);
    if (!media) throw new ApiError(404, 'Media not found');

    // Only allow updating certain fields
    const allowedFields = ['alt_text', 'caption', 'description', 'original_name'];
    const updateData = {};
    
    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = data[key];
      }
    });

    await mediaRepository.update(id, updateData);
    
    const updated = await mediaRepository.findById(id);
    return {
      ...updated,
    url: getFullUrl(updated.path),
    thumbnail_url: getFullUrl(updated.thumbnail_url)
    };
  }
}

module.exports = new MediaService();
