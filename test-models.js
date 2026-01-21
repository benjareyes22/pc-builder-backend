import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

async function checkModels() {
  console.log("🔑 Probando llave:", process.env.GEMINI_API_KEY ? "Detectada (Oculta)" : "NO DETECTADA ❌");
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Pedimos la lista de modelos disponibles para TU llave
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey; // Solo init para validar
    // Corrección: Usamos la función listModels del manager
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    console.log("\n📋 --- MODELOS DISPONIBLES PARA TI ---");
    const misModelos = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    misModelos.forEach(m => {
      console.log(`✅ ${m.name.replace("models/", "")}`);
    });
    console.log("---------------------------------------\n");

  } catch (error) {
    console.error("❌ Error al consultar modelos:", error.message);
  }
}

checkModels();