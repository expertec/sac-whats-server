// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import multer from 'multer';
import path from 'path';





import { sendImageToLead } from './whatsappService.js'; 

import { db, admin } from './firebaseAdmin.js';
const bucket = admin.storage().bucket();


// Dile a fluent-ffmpeg dónde está el binario
ffmpeg.setFfmpegPath(ffmpegInstaller.path);






dotenv.config();



import {
  connectToWhatsApp,
  getLatestQR,
  getConnectionStatus,
  sendMessageToLead,
  getSessionPhone
} from './whatsappService.js';




const app = express();
const port = process.env.PORT || 3001;

const upload = multer({ dest: path.resolve('./uploads') });

app.use(cors());
app.use(bodyParser.json());

// Endpoint para consultar el estado de WhatsApp (QR y conexión)
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    status: getConnectionStatus(),
    qr: getLatestQR()
  });
});

// Nuevo endpoint para obtener el número de sesión
app.get('/api/whatsapp/number', (req, res) => {
  const phone = getSessionPhone();
  if (phone) {
    res.json({ phone });
  } else {
    res.status(503).json({ error: 'WhatsApp no conectado' });
  }
});

// Nuevo endpoint para enviar imagen (comprobante) por WhatsApp
app.post('/api/whatsapp/send-image', async (req, res) => {
  const { phone, imageUrl, caption } = req.body;
  if (!phone || !imageUrl) {
    return res.status(400).json({ error: 'Falta phone o imageUrl' });
  }
  try {
    await sendImageToLead(phone, imageUrl, caption);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error enviando imagen por WhatsApp:', error);
    return res.status(500).json({ error: error.message });
  }
});






// Endpoint para enviar mensaje de WhatsApp
app.post('/api/whatsapp/send-message', async (req, res) => {
  const { leadId, message } = req.body;
  if (!leadId || !message) {
    return res.status(400).json({ error: 'Faltan leadId o message en el body' });
  }

  try {
    const leadRef = db.collection('leads').doc(leadId);
    const leadDoc = await leadRef.get();
    if (!leadDoc.exists) {
      return res.status(404).json({ error: "Lead no encontrado" });
    }

    const { telefono } = leadDoc.data();
    if (!telefono) {
      return res.status(400).json({ error: "Lead sin número de teléfono" });
    }

    // Delega la normalización y el guardado a sendMessageToLead
    const result = await sendMessageToLead(telefono, message);
    return res.json(result);
  } catch (error) {
    console.error("Error enviando mensaje de WhatsApp:", error);
    return res.status(500).json({ error: error.message });
  }
});






// (Opcional) Marcar todos los mensajes de un lead como leídos
app.post('/api/whatsapp/mark-read', async (req, res) => {
  const { leadId } = req.body;
  if (!leadId) {
    return res.status(400).json({ error: "Falta leadId en el body" });
  }
  try {
    await db.collection('leads')
            .doc(leadId)
            .update({ unreadCount: 0 });
    return res.json({ success: true });
  } catch (err) {
    console.error("Error marcando como leídos:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Arranca el servidor y conecta WhatsApp
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
  connectToWhatsApp().catch(err =>
    console.error("Error al conectar WhatsApp en startup:", err)
  );


  
});
