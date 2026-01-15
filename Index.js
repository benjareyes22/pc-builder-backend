import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { setDefaultResultOrder } from 'node:dns';

// 1. MANTENEMOS EL ARREGLO DE INTERNET
setDefaultResultOrder('ipv4first');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 2. ¡AQUÍ ESTÁ EL TRUCO!
// Borra el texto de abajo (incluyendo las comillas si quieres, pero asegúrate de que quede entre comillas al final)
// Y pega la clave que acabas de copiar de la página de Google.
const genAI = new GoogleGenerativeAI("AIzaSyBb5ZRLtjYEAILMbx7uWRNP0TJjVLCwVmU");

// 3. USAMOS EL MODELO QUE SALIÓ EN TU LISTA (El 2.5 Flash)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.get('/', (req, res) => res.send('¡Servidor PC Builder Activo! 🤖'));

app.post('/chat', async (req, res) => {
  try {
    const { mensaje } = req.body;
    console.log("📩 Tu mensaje:", mensaje);

    const result = await model.generateContent(mensaje);
    const response = await result.response;
    const text = response.text();

    console.log("✅ ¡La IA respondió!");
    res.json({ respuesta: text });

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`🚀 Servidor listo en http://localhost:${port}`));