```bash
sox \
  --i \
  "audio/songs/conversation.mp3"
```

```bash
sox \
  --i \
  "audio/fx/Boo! Sound Effect (128 kbps).mp3"
```

* Para converter para o mesmo bit rate:

```bash
sox \
  -v 0.99 \
  -t mp3 \
  "audio/fx/Applause Sound Effect HD No Copyright (128 kbps).mp3" \
  -r 48000 \
  -t mp3 \
  "output.mp3"

```

* Para obter o bit rate the um arquivo de audio:

```bash
sox \
  --i \
  -B \
  "audio/fx/Boo! Sound Effect (128 kbps).mp3"
```

* Para concatenar dois audios:

```bash
sox \
  -t mp3 \
  -v 0.99 \
  -m "audio/songs/conversation.mp3" \
  -t mp3 \
  -v 0.99 \
  "audio/fx/Fart - Gaming Sound Effect (HD) (128 kbps).mp3" \
  -t mp3 \
  "output.mp3"
```