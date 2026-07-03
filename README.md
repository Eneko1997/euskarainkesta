# Inkesta Euskara · Lanbide

Encuesta de necesidades formativas de euskera, migrada de Framer a Next.js.

## Variables de entorno (configurar en Vercel → Settings → Environment Variables)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Si no se configuran, el componente usa los valores por defecto que ya
tenía en Framer (ver `components/LanbideEuskaraSurvey.tsx`).

## Logo

Sube el logo de Lanbide a `public/lanbide-logo.png` (arrastrando el archivo
en GitHub, carpeta `public`). Si no existe, la cabecera simplemente no
muestra logo, no rompe nada.
