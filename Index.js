import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- CONEXIÓN A SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONEXIÓN A GEMINI ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Función para obtener el catálogo
async function getCatalogContext() {
  const { data: products, error } = await supabase
    .from('productos') 
    .select('*')
    .gt('stock', 0);

  if (error || !products) {
    console.error("Error leyendo Supabase:", error);
    return "No hay información de catálogo disponible.";
  }

  // Mapeamos los productos con su categoría para que la IA sepa qué es qué
  const productList = products.map(p => 
    `- [${p.category || 'General'}] ${p.name || p.nombre} (Precio: $${p.price || p.precio})`
  ).join('\n');

  return productList;
}

app.post('/chat', async (req, res) => {
  const { mensaje } = req.body;
  
  if (!mensaje) return res.status(400).json({ error: "Mensaje requerido" });

  console.log(`📩 Cliente: ${mensaje}`);

  try {
    const stockReal = await getCatalogContext();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // EL TRUCO: Le pedimos JSON estricto
    const prompt = `
      Eres "TechnoBot", vendedor experto.
      
      TU MISIÓN:
      1. Analiza el pedido del usuario.
      2. Selecciona del INVENTARIO los mejores componentes compatibles.
      3. Responde SIEMPRE en formato JSON estricto.

      INVENTARIO DISPONIBLE:
      ${stockReal}

      FORMATO DE RESPUESTA (JSON):
      {
        "respuesta": "Texto amigable explicando por qué elegiste estas piezas...",
        "seleccion": {
          "cpu": "Nombre EXACTO del procesador del inventario",
          "motherboard": "Nombre EXACTO de la placa madre",
          "ram": "Nombre EXACTO de la RAM",
          "gpu": "Nombre EXACTO de la tarjeta de video (o null si no necesita)",
          "storage": "Nombre EXACTO del disco",
          "psu": "Nombre EXACTO de la fuente",
          "case": "Nombre EXACTO del gabinete"
        }
      }

      Usuario dice: "${mensaje}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpieza por si la IA pone comillas de código markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    console.log(`🤖 Respuesta JSON: ${text}`);
    
    // Convertimos el texto a Objeto JSON real antes de enviarlo
    const jsonResponse = JSON.parse(text);
    res.json(jsonResponse);

  } catch (error) {
    console.error("❌ ERROR IA:", error.message);
    res.status(500).json({ 
      respuesta: "Tuve un error procesando la orden automática. Intenta de nuevo.",
      seleccion: {} 
    });
  }
});

app.listen(port, () => console.log(`🚀 Servidor Automático listo en puerto ${port}`));