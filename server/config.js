import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = join(currentDir, '../');
const audioDir = join(root, "audio");
const publicDir = join(root, "public");
const songsDir = join(audioDir, "songs");

export default {
  port: process.env.PORT || 3000,
  dir: {
    root,
    publicDir,
    audioDir,
    songsDir: join(audioDir, 'songs'),
    fxDir: join(audioDir, 'fx'),
  },
  pages: {
    home: "home/index.html",
    controller: "controller/index.html",
  },
  location: {
    home: "/home",
  },
  constants: {
    CONTENT_TYPE: {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
    },
    AUDIO_MEDIA_TYPE: "mp3",
    SONG_VOLUME: "0.99",
    FALLBACK_BIT_RATE: "128000",
    BIT_RATE_DIVISOR: 8,
    ENGLISH_CONVERSATION: join(songsDir, 'conversation.mp3'),
  }
};
