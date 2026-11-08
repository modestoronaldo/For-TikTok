# Guía: un video nuevo de "Querido yo"

Esta guía es para la sesión programada que crea cada video. Cada video es **original**: personajes, historia, escenas, guion y música nuevos. El estilo se mantiene: tierno, nocturno, melancólico y cálido.

## Estilo (lo que no cambia)
- Vertical 1080×1920, 24 fps, **21,5 segundos**.
- Noche con luces cálidas (ventanas, lámparas, faroles), grano suave y viñeta.
- Personajes **tiernos y comunes** (gatitos, perritos, ositos, patitos, conejitos, pingüinos...), con ojos grandes y brillantes, mejillas rosadas y contornos suaves. Siempre diseño propio; **nunca** personajes conocidos ni de otros creadores.
- Idea central: **tu yo de ahora le habla a tu yo del pasado** (o un tema parecido: consuelo, seguir adelante, gratitud, extrañar a alguien, cuidarse).
- 3 escenas con cortes directos (A → B → A → C → B → A → C):
  - **A:** el que habla, en un lugar acogedor. La boca se mueve con la voz (`TL.boca`).
  - **B:** el que escucha, solo y triste, que poco a poco recupera la esperanza.
  - **C:** una toma abierta de pausa, la "llegada".
- Subtítulos amarillos (Nunito 900) frase por frase y la firma (Caveat) debajo. La firma está en la constante `FIRMA` de `anim.js`.
- 6 frases cortas en español, unos 14 segundos de voz en total.

## Pasos
1. `npm install` (instala las fuentes).
2. **Inventar** personajes, lugares y guion nuevos, distintos a los videos anteriores (ver `historial.md`).
3. **Voz con ElevenLabs:** `creative_list_voices` (español, suave, calmada), luego `creative_generate_speech` con `model_id: eleven_v4` y **`generations_count: 1`** (para ahorrar créditos). Separar las frases con líneas en blanco y usar etiquetas como `[softly]` o `[tender]`. Descargar el mp3 a `audio/voz_toma1.mp3` (el host `elevenlabsusercontent.com` está permitido).
4. Medir las pausas: `ffmpeg -i audio/voz_toma1.mp3 -af silencedetect=noise=-40dB:d=0.35 -f null -`. Actualizar `FRASES` y `SUBS` en `audio.py`, y `SCENES` en `audio.py` y `anim.js` si cambian.
5. Música nueva: cambiar la progresión o la semilla en `musica.py` y ejecutar `python3 musica.py 21.5`.
6. `python3 audio.py` genera `audio/mezcla.wav` (−14 LUFS) y `timeline.js`.
7. Dibujar las escenas o personajes nuevos en `anim.js` / `personajes.js`. Revisar con `node render.js 1.3 5.6 11 14.2 17.9 20` (vista previa en `preview/`) y mirar las imágenes.
8. Render completo con `node render.js`, luego:
   `ffmpeg -framerate 24 -i frames/%04d.png -i audio/mezcla.wav -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart salida/AAAA-MM-DD_HH.mp4`
9. Enviar el mp4 al usuario y anotar el video en `historial.md` (personajes, lugares, guion) para no repetir.
