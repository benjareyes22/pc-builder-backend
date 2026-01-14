import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// 1. IMPORTAMOS LA LIBRERÍA DE GOOGLE
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 2. CONFIGURAMOS LA IA (Pega tu API Key aquí donde dice "TU_API_KEY_AQUI")
const genAI = new GoogleGenerativeAI("TU_API_KEY_AQUI_O_EN_ENV");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get('/', (req, res) => {
  res.send('¡Servidor de PC Builder AI funcionando! 🤖');
});

// 3. CREAMOS LA RUTA DEL CHAT
app.post('/chat', async (req, res) => {
  try {
    const { mensaje } = req.body; // El frontend nos manda el mensaje
    
    // Le preguntamos a Gemini
    const result = await model.generateContent(mensaje);
    const response = await result.response;
    const text = response.text();

    // Le respondemos al frontend
    res.json({ respuesta: text });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "La IA se mareó" });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});