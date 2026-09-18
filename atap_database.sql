

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;



CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255) NULL,
  auth_provider VARCHAR(20) DEFAULT 'local',
  google_id VARCHAR(100) UNIQUE NULL,
  facebook_id VARCHAR(100) UNIQUE NULL,
  dni_masked VARCHAR(20) NOT NULL,
  dni_hash VARCHAR(64) NULL,
  telefono VARCHAR(30) NULL,
  whatsapp VARCHAR(30) NULL,
  categoria VARCHAR(20) DEFAULT '4ta',
  rol VARCHAR(30) DEFAULT 'Jugador ATAP',
  es_admin BOOLEAN DEFAULT FALSE,
  perfil_incompleto BOOLEAN DEFAULT TRUE,
  completado_onboarding BOOLEAN DEFAULT FALSE,
  avatar_url VARCHAR(255) DEFAULT '/assets/logo.png',
  fecha_registro DATE NULL,
  genero VARCHAR(20) DEFAULT 'Masculino',
  fecha_nacimiento VARCHAR(20) NULL,
  altura VARCHAR(20) DEFAULT '1.75 m',
  peso VARCHAR(20) DEFAULT '70 kg',
  mano_dominante VARCHAR(20) DEFAULT 'Diestro',
  mejor_golpe VARCHAR(50) DEFAULT 'Drive cruzado',
  titulos_ganados INT DEFAULT 0,
  zonas JSON NULL,
  disponibilidad JSON NULL,
  calibracion_golpes JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email),
  INDEX idx_user_dni_hash (dni_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tournaments (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NULL,
  estado VARCHAR(30) DEFAULT 'abierto',
  modalidad VARCHAR(30) DEFAULT 'singles',
  categoria VARCHAR(50) NULL,
  fechas_display VARCHAR(100) NULL,
  fecha_inicio DATE NULL,
  fecha_fin DATE NULL,
  sede VARCHAR(150) NULL,
  direccion VARCHAR(255) NULL,
  superficie VARCHAR(50) DEFAULT 'Arcilla / Polvo de Ladrillo',
  precio DECIMAL(10,2) DEFAULT 80.00,
  precio_display VARCHAR(50) DEFAULT 'S/ 80.00',
  premio VARCHAR(100) NULL,
  imagen_url VARCHAR(255) NULL,
  descripcion TEXT NULL,
  es_destacado BOOLEAN DEFAULT FALSE,
  categorias_cupos JSON NULL,
  grupos JSON NULL,
  bracket JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tourney_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inscriptions (
  id VARCHAR(64) PRIMARY KEY,
  tournament_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NULL,
  nombre VARCHAR(150) NOT NULL,
  dni_masked VARCHAR(20) NOT NULL,
  dni_hash VARCHAR(64) NULL,
  email VARCHAR(150) NULL,
  telefono VARCHAR(30) NULL,
  categoria VARCHAR(20) NOT NULL,
  modalidad VARCHAR(20) DEFAULT 'singles',
  es_dobles BOOLEAN DEFAULT FALSE,
  nombre2 VARCHAR(150) NULL,
  dni_masked2 VARCHAR(20) NULL,
  dni_hash2 VARCHAR(64) NULL,
  email2 VARCHAR(150) NULL,
  telefono2 VARCHAR(30) NULL,
  estado_pago VARCHAR(30) DEFAULT 'pendiente',
  metodo_pago VARCHAR(50) DEFAULT 'Yape',
  comprobante_url VARCHAR(255) NULL,
  comprobante_info TEXT NULL,
  fecha_registro DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_insc_tourney (tournament_id),
  INDEX idx_insc_user (user_id),
  INDEX idx_insc_pago (estado_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ranking (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  name VARCHAR(150) NOT NULL,
  dni_masked VARCHAR(20) NULL,
  dni_hash VARCHAR(64) NULL,
  modalidad VARCHAR(20) DEFAULT 'singles',
  categoria VARCHAR(20) DEFAULT '4ta',
  puntos_num INT DEFAULT 0,
  points_str VARCHAR(30) DEFAULT '0 pts',
  titulos INT DEFAULT 0,
  titulos_ganados INT DEFAULT 0,
  efectividad VARCHAR(20) DEFAULT '70%',
  mano_dominante VARCHAR(30) DEFAULT 'Diestro',
  mejor_golpe VARCHAR(50) DEFAULT 'Drive cruzado',
  avatar_url VARCHAR(255) DEFAULT '/assets/logo.png',
  historial_partidos JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ranking_cat (categoria),
  INDEX idx_ranking_mod (modalidad),
  INDEX idx_ranking_pts (puntos_num DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  summary TEXT NULL,
  content TEXT NULL,
  category VARCHAR(50) NULL,
  image_url VARCHAR(255) NULL,
  author VARCHAR(100) DEFAULT 'Comité ATAP',
  date_display VARCHAR(50) NULL,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sponsors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NULL,
  logo_url VARCHAR(255) NULL,
  link VARCHAR(255) NULL,
  description TEXT NULL,
  active BOOLEAN DEFAULT TRUE,
  order_index INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (id, nombre, email, password_hash, auth_provider, dni_masked, dni_hash, telefono, whatsapp, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('user-admin-atap', 'Administrador ATAP', 'vladimiryt18@gmail.com', '$2b$10$0EOW8z8qYGWxWC8Rf9ZJG.P85aZH.CIjn7/Ri6SWYf7w1bz6qS5ja', 'local', '*****000', '7e071fd9b023ed8f18458a73613a0834f6220bd5cc50357ba3493c6040a9ea8c', '987654321', '987654321', 'Comité ATAP', 'Administrador', TRUE, FALSE, TRUE, '/assets/logo.png', '2026-01-01')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-1', 'Carlos Mendoza', 'carlos.mendoza@amateur.pe', '*****567', '97a6d21df7c51e8289ac1a8c026aaac143e15aa1957f54f42e30d8f8a85c3a55', '4ta', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-2', 'Alonso Herrera', 'alonso.herrera@amateur.pe', '*****678', 'cebe3d9d614ba5c19f633566104315854a11353a333bf96f16b5afa0e90abdc4', '4ta', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-3', 'Santiago Gómez', 'santiago.gómez@amateur.pe', '*****789', '35a9e381b1a27567549b5f8a6f783c167ebf809f1c4d6a9e367240484d8ce281', '4ta', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-4', 'Renato Vargas', 'renato.vargas@amateur.pe', '*****890', 'e6f095e985e6762f1538b47ff1abda58dbe8ce088b16d8a5744fc179e9a2fc16', '4ta', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-5', 'Luciana Pérez', 'luciana.pérez@amateur.pe', '*****901', 'fa88d374b9cf5e059fad4a2fe406feae4c49cbf4803083ec521d3c75ee22557c', '5ta A', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-6', 'Diego Sánchez', 'diego.sánchez@amateur.pe', '*****012', 'bf6aaaab7c143ca12ae448c69fb72bb4cf1b29154b9086a927a0a91ae334cdf7', '5ta A', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-7', 'Valeria Torres', 'valeria.torres@amateur.pe', '*****456', 'b3a8e0e1f9ab1bfe3a36f231f676f78bb30a519d2b21e6c530c0eee8ebb4a5d0', '5ta A', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-8', 'Mateo Castillo', 'mateo.castillo@amateur.pe', '*****234', '114bd151f8fb0c58642d2170da4ae7d7c57977260ac2cc8905306cab6b2acabc', '5ta A', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-9', 'Joaquín Silva', 'joaquín.silva@amateur.pe', '*****123', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', '5ta B', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-10', 'Camila Morales', 'camila.morales@amateur.pe', '*****234', '114bd151f8fb0c58642d2170da4ae7d7c57977260ac2cc8905306cab6b2acabc', '5ta B', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-11', 'Sebastián Reyes', 'sebastián.reyes@amateur.pe', '*****145', 'be47addbcb8f60566a3d7fd5a36f8195798e2848b368195d9a5d20e007c59a0c', '5ta B', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-12', 'Gabriel Rojas', 'gabriel.rojas@amateur.pe', '*****201', '43974ed74066b207c30ffd0fed5146762e6c60745ac977004bc14507c7c42b50', '5ta B', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-13', 'Ignacio Vega', 'ignacio.vega@amateur.pe', '*****312', '865736a1c30a82dc67aba820360a01b1d9d0da5643234cd07c4d60b06eb530c5', '6ta', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-14', 'Mariana Flores', 'mariana.flores@amateur.pe', '*****423', '814bb6b8dc12188a44b71e378dc20a4292e01979aa9ab95b09b8a681391dfc9d', '6ta', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-15', 'Álvaro Campos', 'álvaro.campos@amateur.pe', '*****534', '5ef6514ed3304cf62b950982541114ac352c52729dbf80747775a9d1a733af93', '6ta', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
INSERT INTO users (id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES
('p-16', 'Rodrigo Paredes', 'rodrigo.paredes@amateur.pe', '*****645', '3c2308b1bc64683e5aed4111841da5bc3b3295b01a852f1dc4e68510f79dd37f', '6ta', 'Jugador ATAP', FALSE, FALSE, TRUE, '/assets/logo.png', '2026-01-15')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);


INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-1', 'p-1', 'Carlos Mendoza', '*****567', '97a6d21df7c51e8289ac1a8c026aaac143e15aa1957f54f42e30d8f8a85c3a55', 'singles', '4ta', 1450, '1,450 pts', 3, 3, '85%', 'Diestro', 'Drive invertido', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-2', 'p-2', 'Alonso Herrera', '*****678', 'cebe3d9d614ba5c19f633566104315854a11353a333bf96f16b5afa0e90abdc4', 'singles', '4ta', 1320, '1,320 pts', 2, 2, '82%', 'Diestro', 'Drop shot', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-3', 'p-3', 'Santiago Gómez', '*****789', '35a9e381b1a27567549b5f8a6f783c167ebf809f1c4d6a9e367240484d8ce281', 'singles', '4ta', 1210, '1,210 pts', 1, 1, '78%', 'Zurdo', 'Reves paralelo', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-4', 'p-4', 'Renato Vargas', '*****890', 'e6f095e985e6762f1538b47ff1abda58dbe8ce088b16d8a5744fc179e9a2fc16', 'singles', '4ta', 1100, '1,100 pts', 1, 1, '75%', 'Diestro', 'Saque plano', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-5', 'p-5', 'Luciana Pérez', '*****901', 'fa88d374b9cf5e059fad4a2fe406feae4c49cbf4803083ec521d3c75ee22557c', 'singles', '5ta A', 1280, '1,280 pts', 2, 2, '84%', 'Diestro', 'Drive cruzado', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-6', 'p-6', 'Diego Sánchez', '*****012', 'bf6aaaab7c143ca12ae448c69fb72bb4cf1b29154b9086a927a0a91ae334cdf7', 'singles', '5ta A', 1150, '1,150 pts', 1, 1, '79%', 'Diestro', 'Slice defensivo', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-7', 'p-7', 'Valeria Torres', '*****456', 'b3a8e0e1f9ab1bfe3a36f231f676f78bb30a519d2b21e6c530c0eee8ebb4a5d0', 'singles', '5ta A', 1040, '1,040 pts', 1, 1, '76%', 'Zurdo', 'Reves a dos manos', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-8', 'p-8', 'Mateo Castillo', '*****234', '114bd151f8fb0c58642d2170da4ae7d7c57977260ac2cc8905306cab6b2acabc', 'singles', '5ta A', 950, '950 pts', 0, 0, '71%', 'Diestro', 'Volea de bloqueo', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-9', 'p-9', 'Joaquín Silva', '*****123', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'singles', '5ta B', 1190, '1,190 pts', 2, 2, '80%', 'Diestro', 'Drive con topspin', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-10', 'p-10', 'Camila Morales', '*****234', '114bd151f8fb0c58642d2170da4ae7d7c57977260ac2cc8905306cab6b2acabc', 'singles', '5ta B', 1080, '1,080 pts', 1, 1, '77%', 'Diestro', 'Saque con slice', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-11', 'p-11', 'Sebastián Reyes', '*****145', 'be47addbcb8f60566a3d7fd5a36f8195798e2848b368195d9a5d20e007c59a0c', 'singles', '5ta B', 970, '970 pts', 0, 0, '73%', 'Zurdo', 'Passing shot', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-12', 'p-12', 'Gabriel Rojas', '*****201', '43974ed74066b207c30ffd0fed5146762e6c60745ac977004bc14507c7c42b50', 'singles', '5ta B', 890, '890 pts', 0, 0, '69%', 'Diestro', 'Globo ofensivo', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-13', 'p-13', 'Ignacio Vega', '*****312', '865736a1c30a82dc67aba820360a01b1d9d0da5643234cd07c4d60b06eb530c5', 'singles', '6ta', 980, '980 pts', 1, 1, '74%', 'Diestro', 'Drive plano', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-14', 'p-14', 'Mariana Flores', '*****423', '814bb6b8dc12188a44b71e378dc20a4292e01979aa9ab95b09b8a681391dfc9d', 'singles', '6ta', 870, '870 pts', 0, 0, '70%', 'Diestro', 'Reves cortado', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-15', 'p-15', 'Álvaro Campos', '*****534', '5ef6514ed3304cf62b950982541114ac352c52729dbf80747775a9d1a733af93', 'singles', '6ta', 790, '790 pts', 0, 0, '67%', 'Diestro', 'Saque liftado', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);
INSERT INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, efectividad, mano_dominante, mejor_golpe, avatar_url) VALUES
('p-16', 'p-16', 'Rodrigo Paredes', '*****645', '3c2308b1bc64683e5aed4111841da5bc3b3295b01a852f1dc4e68510f79dd37f', 'singles', '6ta', 720, '720 pts', 0, 0, '65%', 'Zurdo', 'Drop shot', '/assets/logo.png')
ON DUPLICATE KEY UPDATE puntos_num=VALUES(puntos_num);



INSERT INTO tournaments (id, title, slug, estado, modalidad, categoria, fechas_display, fecha_inicio, fecha_fin, sede, direccion, superficie, precio, precio_display, premio, imagen_url, descripcion, es_destacado, categorias_cupos, grupos, bracket) VALUES
('t-apertura-2026', 'Torneo Apertura ATAP 2026', 'torneo-apertura-atap-2026', 'abierto', 'singles', '4ta, 5ta A, 5ta B, 6ta', '15 Mar - 29 Mar 2026', '2026-03-15', '2026-03-29', 'Club Lawn Tennis de la Exposición', 'Av. 28 de Julio 744, Jesús María, Lima', 'Arcilla / Polvo de Ladrillo', 85, 'S/ 85.00', 'S/ 2,500 + Trofeos Oficiales', '/assets/apertura.jpg', 'El torneo oficial inaugural del Circuito Amateur de Tenis del Perú (ATAP) 2026.', TRUE, '[{"id":"cat-4","nombre":"4ta","cupos":16,"inscritos":8},{"id":"cat-5a","nombre":"5ta A","cupos":16,"inscritos":12},{"id":"cat-5b","nombre":"5ta B","cupos":32,"inscritos":16},{"id":"cat-6","nombre":"6ta","cupos":32,"inscritos":20}]', '[{"id":"grupo-a","nombre":"Grupo A","participantes":[],"partidos":[]},{"id":"grupo-b","nombre":"Grupo B","participantes":[],"partidos":[]},{"id":"grupo-c","nombre":"Grupo C","participantes":[],"partidos":[]},{"id":"grupo-d","nombre":"Grupo D","participantes":[],"partidos":[]}]', '{"rounds":[{"roundIndex":1,"roundName":"Cuartos de final","matches":[]},{"roundIndex":2,"roundName":"Semifinales","matches":[]},{"roundIndex":3,"roundName":"Final","matches":[]}],"champion":null}')
ON DUPLICATE KEY UPDATE title=VALUES(title);
INSERT INTO tournaments (id, title, slug, estado, modalidad, categoria, fechas_display, fecha_inicio, fecha_fin, sede, direccion, superficie, precio, precio_display, premio, imagen_url, descripcion, es_destacado, categorias_cupos, grupos, bracket) VALUES
('t-copa-dobles-2026', 'Copa Nacional de Dúos y Dobles ATAP', 'copa-nacional-duos-dobles-atap-2026', 'proximo', 'dobles', '4ta Dobles, 5ta A Dobles, 5ta B Dobles', '12 Abr - 26 Abr 2026', '2026-04-12', '2026-04-26', 'Rinconada Country Club', 'Av. Manuel Prado Ugarteche 901, La Molina, Lima', 'Arcilla / Polvo de Ladrillo', 140, 'S/ 140.00 por dupla', 'S/ 3,000 + Palas/Raquetas Oficiales', '/assets/dobles.jpg', 'Competición en parejas y dúos oficiales del circuito amateur en Lima.', FALSE, '[{"id":"cat-d4","nombre":"4ta Dobles","cupos":16,"inscritos":4},{"id":"cat-d5a","nombre":"5ta A Dobles","cupos":16,"inscritos":6},{"id":"cat-d5b","nombre":"5ta B Dobles","cupos":16,"inscritos":8}]', '[]', 'null')
ON DUPLICATE KEY UPDATE title=VALUES(title);


INSERT INTO sponsors (id, name, category, logo_url, link, description, active, order_index) VALUES
('sp-1', 'Wilson Perú', 'Equipamiento Oficial', '/assets/sponsors/wilson.png', 'https://wilson.com', 'Pelotas oficiales y raquetas del circuito ATAP', TRUE, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO sponsors (id, name, category, logo_url, link, description, active, order_index) VALUES
('sp-2', 'Gatorade', 'Hidratación Oficial', '/assets/sponsors/gatorade.png', 'https://gatorade.com', 'Bebidas isotónicas en todas las sedes del circuito', TRUE, 2)
ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO sponsors (id, name, category, logo_url, link, description, active, order_index) VALUES
('sp-3', 'Babolat', 'Partner Técnico', '/assets/sponsors/babolat.png', 'https://babolat.com', 'Encordado oficial y accesorios de tenis', TRUE, 3)
ON DUPLICATE KEY UPDATE name=VALUES(name);


INSERT INTO news (id, title, summary, content, category, image_url, author, date_display, featured) VALUES
('news-1', 'Arranca la Temporada Oficial 2026 del Circuito ATAP', 'Más de 200 tenistas amateurs disputarán el Torneo Apertura en las mejores canchas de Lima.', 'La Asociación de Tenistas Amateur del Perú da inicio a su calendario oficial 2026 con 6 torneos puntuables y el Master Final de fin de año.', 'Institucional', '/assets/news1.jpg', 'Comité Directivo ATAP', '10 Feb 2026', TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

SET FOREIGN_KEY_CHECKS = 1;
