# Guía: SQLite + Bot de Telegram

## SQLite (base de datos local)

**Sí, ya está configurado con SQLite** para desarrollo. No necesitas instalar PostgreSQL en tu PC.

En `.env` (raíz del proyecto backend):

```env
DATABASE_URL=file:./dev.db
```

La base de datos se guarda en:

```
prisma/dev.db
```

### Comandos útiles

```powershell
cd c:\Users\Harry\Music\UwU\lumiere-survey-backend

# Crear/actualizar tablas
npx prisma migrate dev

# Ver datos en el navegador (GUI)
npx prisma studio
```

`prisma studio` abre http://localhost:5555 donde puedes ver todas las respuestas de la encuesta.

> **Producción (Railway/Render/Docker):** ahí sí se usa PostgreSQL. En local, SQLite es perfecto.

---

## Crear el bot de Telegram (paso a paso)

### 1. Crear el bot con BotFather

1. Abre Telegram y busca **[@BotFather](https://t.me/BotFather)**
2. Envía: `/newbot`
3. Elige un **nombre** (ej: `Lumière Survey`)
4. Elige un **username** que termine en `bot` (ej: `lumiere_survey_bot`)
5. BotFather te dará un **token** como este:

```
7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

6. Copia ese token → pégalo en `.env`:

```env
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Obtener tu Chat ID

1. Busca **[@userinfobot](https://t.me/userinfobot)** en Telegram
2. Envíale cualquier mensaje (ej: `/start`)
3. Te responderá con tu **Id** (un número como `123456789`)
4. Cópialo en `.env`:

```env
TELEGRAM_CHAT_ID=123456789
```

### 3. Activar el bot

1. Busca tu bot en Telegram (por el username que elegiste, ej: `@lumiere_survey_bot`)
2. Pulsa **Iniciar** o envía `/start`
3. Arranca el backend:

```powershell
cd c:\Users\Harry\Music\UwU
pnpm dev
```

Deberías ver en la consola: `Telegram bot listening for commands...`

---

## Comandos del bot

Solo responde al chat configurado en `TELEGRAM_CHAT_ID` (tu cuenta).

| Comando | Qué hace |
|---------|----------|
| `/start` o `/ayuda` | Muestra ayuda |
| `/hoy` | Respuestas recibidas hoy |
| `/buscar` | Te pregunta fecha inicio y fecha fin |
| `/buscar 2025-01-01 2025-06-30` | Busca directo sin preguntar |
| `/cancelar` | Cancela una búsqueda en curso |

### Ejemplo de conversación

```
Tú:    /buscar
Bot:   ¿Desde qué fecha?
Tú:    2025-06-01
Bot:   ¿Hasta qué fecha?
Tú:    2025-06-30
Bot:   📊 Resultados... (lista de respuestas)
```

Formatos de fecha aceptados:
- `2025-06-24` (recomendado)
- `24/06/2025`

---

## Probar que funciona

1. Asegúrate de que el backend corre (`pnpm dev`)
2. Envía `/start` a tu bot → debe responder con la ayuda
3. Completa la encuesta en http://localhost:5173
4. Deberías recibir una notificación automática en Telegram
5. Envía `/hoy` → debe listar la respuesta que acabas de enviar

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Bot no responde | Verifica `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en `.env` |
| "No tienes permiso" | El `TELEGRAM_CHAT_ID` debe ser **tu** ID de @userinfobot |
| No llegan notificaciones | Envía `/start` al bot primero; reinicia el backend |
| Error polling | Solo puede haber **una instancia** del bot corriendo a la vez |
