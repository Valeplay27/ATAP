export function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo de imagen.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json({
      message: 'Archivo subido exitosamente.',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error en uploadFile:', error);
    return res.status(500).json({ error: 'Error al procesar la subida del archivo.' });
  }
}

export default {
  uploadFile
};
