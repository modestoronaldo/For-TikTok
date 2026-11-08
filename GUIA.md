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

## Video según la hora
La tarea corre dos veces al día. Mira la hora con `date -u +%H`.

### 🌤️ Mediodía (12–23 UTC, mediodía en Latinoamérica)
- **Tono:** esperanzador y con ánimo para seguir el día. Puede tener un toque melancólico, pero termina luminoso.
- **Ambiente:** amanecer o tarde soleada, cielo naranja-rosado o celeste, luz cálida y dorada, pájaros, flores, parques, ventanas con sol, una cocina por la mañana, un camino con árboles.
- **Mensajes (ejemplos de tema, escribe frases nuevas):** hoy también puedes, ve a tu ritmo, date un respiro, no tienes que tenerlo todo resuelto.
- **Música:** tonalidad mayor o menor luminosa (por ejemplo, Do mayor o Fa mayor), un poco más ágil.

### 🌙 Noche (0–11 UTC, noche en Latinoamérica)
- **Tono:** melancólico y de consuelo, cálido al final.
- **Ambiente:** noche, lluvia, estrellas, luna, luces cálidas, lugares acogedores o solitarios (estación, balcón, faro, muelle, ventana con lluvia).
- **Mensajes (ejemplos de tema, escribe frases nuevas):** descansa, ya hiciste suficiente; está bien extrañar; tu yo del pasado estaría orgulloso; mañana es otra oportunidad.
- **Música:** tonalidad menor, lenta (como el primer video).

## Reflexiones: un tema distinto en cada video
Cada video es una **reflexión sobre un tema diferente**. Elige el primer tema del banco que **no** aparezca en `historial.md` y que encaje con la hora (🌤️ mediodía / 🌙 noche / ✨ ambos). Cuando se acaben, vuelve a empezar con una mirada nueva.

| # | Tema | Hora | Idea de historia (como punto de partida, no como guion) |
|---|---|---|---|
| 1 | Extrañar a mamá o papá | 🌙 | Alguien guarda la bufanda que le tejieron; la llamada que siempre se pospone |
| 2 | Amistad que se alejó | 🌙 | Dos amigos que antes compartían banca y ahora solo un "me gusta" |
| 3 | Ansiedad | ✨ | Un personaje carga una nube pequeña que crece; aprende a respirar con ella |
| 4 | Amor propio | 🌤️ | Se mira en un charco y por fin se sonríe |
| 5 | Mascota que ya no está | 🌙 | El plato vacío, la correa colgada, una estrella que brilla |
| 6 | Migrar / estar lejos de casa | 🌙 | Un pajarito en una ciudad gigante, una videollamada con la abuela |
| 7 | Empezar de nuevo | 🌤️ | Una semilla que se cae de la maceta y brota en otro lugar |
| 8 | Paciencia, todo a su tiempo | 🌤️ | Una tortuguita que llega tarde, pero llega |
| 9 | Descansar sin culpa | 🌙 | Un osito apaga la lámpara y deja la lista de pendientes |
| 10 | Gratitud por lo pequeño | 🌤️ | Pan caliente, una ventana con sol, un mensaje de buenos días |
| 11 | Soledad acompañada | 🌙 | Dos ventanas iluminadas en edificios distintos, dos personajes despiertos |
| 12 | Fracasar y seguir | 🌤️ | Un patito que se cae intentando volar y lo vuelve a intentar |
| 13 | Crecer y dejar la infancia | 🌙 | Un juguete viejo en una caja, recuerdos que se vuelven luz |
| 14 | Perdonarse | ✨ | Un personaje recoge los pedazos de una taza y hace un jarrón con ellos |
| 15 | Hermanos | ✨ | Uno mayor que cuida y uno menor que admira |
| 16 | Amor que terminó | 🌙 | Dos tazas en la mesa, ahora una; aprender a tomar el té solo |
| 17 | Sueños que todavía esperan | 🌤️ | Una maleta lista debajo de la cama |
| 18 | Cuidar a quien te cuida | ✨ | Un hijo que ahora tapa con una manta al abuelo |
| 19 | Cansancio de ser fuerte | 🌙 | Un personaje que siempre sostiene el paraguas para otros, y alguien se lo sostiene a él |
| 20 | El primer día de algo | 🌤️ | Mochila nueva, nervios, una puerta grande |

## Reglas de creatividad
- **Personajes nuevos en cada video**, tiernos y comunes (gatitos, perritos, ositos, patitos, conejitos, pingüinos, tortuguitas, pajaritos, zorritos, mapaches...), siempre de diseño propio.
- **Varía la estructura.** No siempre una llamada telefónica. Otras formas: una carta que se lee, un recuerdo (flashback), un antes y un después, un diálogo entre dos personajes, un personaje que habla solo, una voz que narra.
- **Varía los lugares y el clima:** cocina, tren, playa, nieve, azotea, parque, hospital, aeropuerto, bosque, invernadero, autobús de noche...
- **Un detalle simbólico** en cada video, que diga algo sin palabras (como la lágrima o las orejitas que se levantan).
- **Un giro emocional** al final: el personaje cambia, entiende algo o recibe un gesto.
- **Frases propias.** Nunca citas famosas, letras de canciones ni textos de otros autores.

## Control de calidad antes de enviar
- [ ] Las vistas previas se revisaron y los personajes se ven tiernos y expresivos, sin piezas mal ubicadas.
- [ ] Los subtítulos coinciden con la voz y se leen bien.
- [ ] La boca se mueve con la voz y hay movimiento en cada escena (parpadeos, viento, luces).
- [ ] Música, sonidos de ambiente y voz bien mezclados (−14 LUFS).
- [ ] El tema, los personajes y el lugar son distintos a los de `historial.md`.
