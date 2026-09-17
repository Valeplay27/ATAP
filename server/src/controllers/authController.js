import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateToken } from '../middlewares/auth.js';
import { maskDni, hashDni } from '../utils/dniHelper.js';

export async function register(req, res) {
  try {
    const { nombre, email, password, dni, telefono, whatsapp, categoria } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre completo es obligatorio.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'El correo electrónico no es válido.' });
    }
    if (!dni || String(dni).trim().length < 5) {
      return res.status(400).json({ error: 'El DNI o documento es obligatorio (mínimo 5 dígitos).' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanDni = String(dni).trim().replace(/\s+/g, '');
    const maskedDni = maskDni(cleanDni);
    const dHash = hashDni(cleanDni);

    // Verificar si ya existe el correo
    const existing = await query('SELECT id, email, dni_masked FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe una cuenta registrada con este correo electrónico.' });
    }

    // Verificar duplicado de DNI
    if (dHash) {
      const existingDni = await query('SELECT id, nombre, dni_masked FROM users WHERE dni_hash = ?', [dHash]);
      if (existingDni.length > 0) {
        return res.status(400).json({
          error: `El DNI ${maskedDni} ya se encuentra registrado a nombre de ${existingDni[0].nombre}.`
        });
      }
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = password ? bcrypt.hashSync(password, 10) : null;
    const cleanPhone = (telefono || whatsapp || '').trim();
    const cleanCat = categoria || '4ta';
    const now = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO users (
        id, nombre, email, password_hash, auth_provider, dni_masked, dni_hash,
        telefono, whatsapp, categoria, rol, es_admin, perfil_incompleto,
        completado_onboarding, avatar_url, fecha_registro
      ) VALUES (?, ?, ?, ?, 'local', ?, ?, ?, ?, ?, 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', ?)`,
      [userId, nombre.trim(), cleanEmail, passwordHash, maskedDni, dHash, cleanPhone, cleanPhone, cleanCat, now]
    );

    // Sincronizar o registrar en tabla `ranking`
    const existingRank = await query('SELECT id FROM ranking WHERE dni_hash = ? OR user_id = ?', [dHash, userId]);
    if (existingRank.length === 0) {
      await query(
        `INSERT INTO ranking (
          id, user_id, name, dni_masked, dni_hash, modalidad, categoria,
          puntos_num, points_str, titulos, titulos_ganados, avatar_url
        ) VALUES (?, ?, ?, ?, ?, 'singles', ?, 0, '0 pts', 0, 0, '/assets/logo.png')`,
        [`p-${userId}`, userId, nombre.trim(), maskedDni, dHash, cleanCat]
      );
    }

    const [createdUser] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    delete createdUser.password_hash;
    const token = generateToken(createdUser);

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: {
        ...createdUser,
        dni: createdUser.dni_masked,
        documentoIdentidad: createdUser.dni_masked,
        avatar: createdUser.avatar_url,
        image: createdUser.avatar_url
      },
      token
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ error: 'Error interno al registrar usuario.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor ingresa tu correo y contraseña.' });
    }

    const cleanInput = email.trim().toLowerCase();
    let users = await query('SELECT * FROM users WHERE email = ?', [cleanInput]);

    // Si no encontró por email, verificar si ingresó DNI
    if (users.length === 0) {
      const dHash = hashDni(cleanInput);
      if (dHash) {
        users = await query('SELECT * FROM users WHERE dni_hash = ?', [dHash]);
      }
    }

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas. No se encontró la cuenta.' });
    }

    const user = users[0];

    // Verificar contraseña
    const isValid = user.password_hash ? bcrypt.compareSync(password, user.password_hash) : false;
    if (!isValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta. Por favor intenta de nuevo.' });
    }

    delete user.password_hash;
    const token = generateToken(user);

    return res.json({
      message: 'Inicio de sesión exitoso.',
      user: {
        ...user,
        dni: user.dni_masked,
        documentoIdentidad: user.dni_masked,
        avatar: user.avatar_url,
        image: user.avatar_url
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
}

// Extracción de datos de Google o Facebook para auto-rellenar formulario (Nombre, Email, Teléfono)
// SIN extraer imagen de perfil social (mantiene logo ATAP)
export async function getSocialInfo(req, res) {
  try {
    const { provider, token, email, name, phone } = req.body;

    let autofill = {
      nombre: '',
      email: '',
      telefono: ''
    };

    // Si viene de Google o Facebook con token, verificar
    if (provider === 'google' && token) {
      try {
        // Validación contra endpoint oficial de Google
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        if (response.ok) {
          const googleData = await response.json();
          autofill.nombre = googleData.name || '';
          autofill.email = googleData.email || '';
        }
      } catch (e) {
        console.warn('Verificación remota de Google falló, usando fallback local.');
      }
    } else if (provider === 'facebook' && token) {
      try {
        const response = await fetch(`https://graph.facebook.com/me?fields=name,email&access_token=${token}`);
        if (response.ok) {
          const fbData = await response.json();
          autofill.nombre = fbData.name || '';
          autofill.email = fbData.email || '';
        }
      } catch (e) {
        console.warn('Verificación remota de Facebook falló, usando fallback local.');
      }
    }

    // Fallback con datos directos recibidos si no hay token OAuth activo en local
    if (!autofill.email && email) autofill.email = email.trim().toLowerCase();
    if (!autofill.nombre && name) autofill.nombre = name.trim();
    if (phone) autofill.telefono = String(phone).trim();

    if (!autofill.email) {
      return res.status(400).json({ error: `No se pudo obtener el correo desde ${provider || 'la cuenta social'}.` });
    }

    // Verificar si el usuario ya existe registrado con DNI completo en MySQL
    const users = await query('SELECT * FROM users WHERE email = ?', [autofill.email]);
    if (users.length > 0 && !users[0].perfil_incompleto && users[0].dni_masked) {
      const user = users[0];
      delete user.password_hash;
      const jwtToken = generateToken(user);
      return res.json({
        exists: true,
        message: 'Usuario verificado existente.',
        user: {
          ...user,
          dni: user.dni_masked,
          documentoIdentidad: user.dni_masked,
          avatar: user.avatar_url,
          image: user.avatar_url
        },
        token: jwtToken
      });
    }

    // Si es nuevo o no tiene DNI, retornar los datos para auto-rellenar y pedir DNI manual
    return res.json({
      exists: false,
      requireDni: true,
      provider: provider || 'social',
      autofill: {
        nombre: autofill.nombre,
        email: autofill.email,
        telefono: autofill.telefono
      }
    });
  } catch (error) {
    console.error('Error en getSocialInfo:', error);
    return res.status(500).json({ error: 'Error al procesar autenticación con red social.' });
  }
}

export async function getMe(req, res) {
  try {
    const users = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    const user = users[0];
    delete user.password_hash;

    return res.json({
      ...user,
      dni: user.dni_masked,
      documentoIdentidad: user.dni_masked,
      avatar: user.avatar_url,
      image: user.avatar_url
    });
  } catch (error) {
    console.error('Error en getMe:', error);
    return res.status(500).json({ error: 'Error al obtener datos del usuario.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      nombre, telefono, whatsapp, categoria, documentoIdentidad,
      genero, fechaNacimiento, altura, peso, manoDominante, mejorGolpe,
      titulosGanados, zonas, disponibilidad, calibracionGolpes, avatarUrl
    } = req.body;

    const rawDni = (documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
    const maskedDni = rawDni ? maskDni(rawDni) : null;
    const dHash = rawDni ? hashDni(rawDni) : null;

    const updates = [];
    const params = [];

    if (nombre) { updates.push('nombre = ?'); params.push(nombre.trim()); }
    if (telefono !== undefined) { updates.push('telefono = ?'); params.push(telefono); }
    if (whatsapp !== undefined) { updates.push('whatsapp = ?'); params.push(whatsapp); }
    if (categoria) { updates.push('categoria = ?'); params.push(categoria); }
    if (maskedDni) { updates.push('dni_masked = ?'); params.push(maskedDni); }
    if (dHash) { updates.push('dni_hash = ?'); params.push(dHash); }
    if (genero) { updates.push('genero = ?'); params.push(genero); }
    if (fechaNacimiento) { updates.push('fecha_nacimiento = ?'); params.push(fechaNacimiento); }
    if (altura) { updates.push('altura = ?'); params.push(altura); }
    if (peso) { updates.push('peso = ?'); params.push(peso); }
    if (manoDominante) { updates.push('mano_dominante = ?'); params.push(manoDominante); }
    if (mejorGolpe) { updates.push('mejor_golpe = ?'); params.push(mejorGolpe); }
    if (titulosGanados !== undefined) { updates.push('titulos_ganados = ?'); params.push(titulosGanados); }
    if (zonas) { updates.push('zonas = ?'); params.push(JSON.stringify(zonas)); }
    if (disponibilidad) { updates.push('disponibilidad = ?'); params.push(JSON.stringify(disponibilidad)); }
    if (calibracionGolpes) { updates.push('calibracion_golpes = ?'); params.push(JSON.stringify(calibracionGolpes)); }
    if (avatarUrl) { updates.push('avatar_url = ?'); params.push(avatarUrl); }

    if (updates.length > 0) {
      params.push(userId);
      await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    delete updated.password_hash;

    return res.json({
      message: 'Perfil actualizado exitosamente.',
      user: {
        ...updated,
        dni: updated.dni_masked,
        documentoIdentidad: updated.dni_masked,
        avatar: updated.avatar_url,
        image: updated.avatar_url
      }
    });
  } catch (error) {
    console.error('Error en updateProfile:', error);
    return res.status(500).json({ error: 'Error al actualizar perfil.' });
  }
}

export default {
  register,
  login,
  getSocialInfo,
  getMe,
  updateProfile
};
