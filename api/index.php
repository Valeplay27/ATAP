<?php
require_once __DIR__ . '/db.php';

$pdo = Database::getConnection();

// Extraer ruta solicitada
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = parse_url($requestUri, PHP_URL_PATH);

// Remover prefijo /api o /ATAP/api si está en subcarpeta
$path = preg_replace('#^.*?/api#', '', $basePath);
$path = trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];
$body = Database::getRequestBody();

// -----------------------------------------------------------------------------
// 1. HEALTH CHECK
// -----------------------------------------------------------------------------
if ($path === 'health' || $path === '') {
    Database::jsonResponse([
        'status' => 'ok',
        'service' => 'ATAP PHP API (SiteGround)',
        'database' => 'MySQL',
        'timestamp' => date('c')
    ]);
}

// -----------------------------------------------------------------------------
// 2. AUTENTICACIÓN (/auth)
// -----------------------------------------------------------------------------
if ($path === 'auth/login' && $method === 'POST') {
    $email = strtolower(trim($body['email'] ?? ''));
    $password = (string)($body['password'] ?? '');

    if (empty($email) || empty($password)) {
        Database::jsonResponse(['error' => 'Por favor ingresa tu correo y contraseña.'], 400);
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE LOWER(email) = ? OR dni_masked = ?');
    $stmt->execute([$email, $email]);
    $user = $stmt->fetch();

    if (!$user) {
        Database::jsonResponse(['error' => 'Credenciales incorrectas. No se encontró la cuenta.'], 401);
    }

    $isValid = false;
    if (!empty($user['password_hash'])) {
        $isValid = password_verify($password, $user['password_hash']);
    }

    // Acceso especial garantizado para la cuenta de administración oficial
    if (!$isValid && strtolower($user['email']) === 'vladimiryt18@gmail.com') {
        if ($password === 'Pumita30****' || $password === 'admin123') {
            $isValid = true;
            // Actualizar hash con bcrypt moderno
            $newHash = password_hash($password, PASSWORD_BCRYPT);
            $upd = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
            $upd->execute([$newHash, $user['id']]);
        }
    }

    if (!$isValid) {
        Database::jsonResponse(['error' => 'Contraseña incorrecta. Por favor intenta de nuevo.'], 401);
    }

    unset($user['password_hash']);
    $token = SimpleJWT::sign([
        'id' => $user['id'],
        'email' => $user['email'],
        'nombre' => $user['nombre'],
        'rol' => $user['rol'],
        'es_admin' => (bool)$user['es_admin']
    ], JWT_SECRET);

    Database::jsonResponse([
        'message' => 'Inicio de sesión exitoso.',
        'user' => array_merge($user, [
            'dni' => $user['dni_masked'],
            'documentoIdentidad' => $user['dni_masked'],
            'avatar' => $user['avatar_url'],
            'image' => $user['avatar_url']
        ]),
        'token' => $token
    ]);
}

if ($path === 'auth/register' && $method === 'POST') {
    $nombre = trim($body['nombre'] ?? '');
    $email = strtolower(trim($body['email'] ?? ''));
    $password = (string)($body['password'] ?? '');
    $dni = trim($body['dni'] ?? '');

    if (empty($nombre) || empty($email) || empty($dni)) {
        Database::jsonResponse(['error' => 'Nombre, correo y DNI son obligatorios.'], 400);
    }

    $maskedDni = Database::maskDni($dni);
    $dHash = hash('sha256', preg_replace('/\s+/', '', $dni));

    // Verificar si ya existe correo
    $check = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $check->execute([$email]);
    if ($check->fetch()) {
        Database::jsonResponse(['error' => 'Ya existe una cuenta con este correo electrónico.'], 400);
    }

    $userId = 'user-' . time() . '-' . substr(md5(uniqid()), 0, 6);
    $passwordHash = !empty($password) ? password_hash($password, PASSWORD_BCRYPT) : null;
    $cleanPhone = trim($body['telefono'] ?? $body['whatsapp'] ?? '');
    $cat = $body['categoria'] ?? '4ta';
    $now = date('Y-m-d');

    $ins = $pdo->prepare('INSERT INTO users (id, nombre, email, password_hash, dni_masked, dni_hash, telefono, whatsapp, categoria, rol, es_admin, perfil_incompleto, completado_onboarding, avatar_url, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "Jugador ATAP", 0, 0, 1, "/assets/logo.png", ?)');
    $ins->execute([$userId, $nombre, $email, $passwordHash, $maskedDni, $dHash, $cleanPhone, $cleanPhone, $cat, $now]);

    // Registrar en tabla ranking si no existe
    $rk = $pdo->prepare('INSERT IGNORE INTO ranking (id, user_id, name, dni_masked, dni_hash, modalidad, categoria, puntos_num, points_str, titulos, titulos_ganados, avatar_url) VALUES (?, ?, ?, ?, ?, "singles", ?, 0, "0 pts", 0, 0, "/assets/logo.png")');
    $rk->execute(['p-' . $userId, $userId, $nombre, $maskedDni, $dHash, $cat]);

    $token = SimpleJWT::sign([
        'id' => $userId,
        'email' => $email,
        'nombre' => $nombre,
        'rol' => 'Jugador ATAP',
        'es_admin' => false
    ], JWT_SECRET);

    Database::jsonResponse([
        'message' => 'Usuario registrado exitosamente.',
        'user' => [
            'id' => $userId,
            'nombre' => $nombre,
            'email' => $email,
            'dni' => $maskedDni,
            'documentoIdentidad' => $maskedDni,
            'categoria' => $cat,
            'avatar' => '/assets/logo.png',
            'image' => '/assets/logo.png'
        ],
        'token' => $token
    ], 201);
}

if ($path === 'auth/me' && $method === 'GET') {
    $authUser = Database::authenticate();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$authUser['id']]);
    $user = $stmt->fetch();
    if (!$user) Database::jsonResponse(['error' => 'Usuario no encontrado.'], 404);
    unset($user['password_hash']);
    Database::jsonResponse(array_merge($user, [
        'dni' => $user['dni_masked'],
        'documentoIdentidad' => $user['dni_masked'],
        'avatar' => $user['avatar_url'],
        'image' => $user['avatar_url']
    ]));
}

// -----------------------------------------------------------------------------
// 3. TORNEOS (/tournaments)
// -----------------------------------------------------------------------------
if ($path === 'tournaments' && $method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM tournaments ORDER BY fecha_inicio DESC, created_at DESC');
    $tournaments = $stmt->fetchAll();

    $result = array_map(function($t) use ($pdo) {
        // Obtener inscripciones de cada torneo
        $inscStmt = $pdo->prepare('SELECT * FROM inscriptions WHERE tournament_id = ? ORDER BY created_at ASC');
        $inscStmt->execute([$t['id']]);
        $inscriptions = $inscStmt->fetchAll();

        $mappedInsc = array_map(function($i) {
            return [
                'id' => $i['id'],
                'nombre' => $i['nombre'],
                'name' => $i['nombre'],
                'dni' => $i['dni_masked'],
                'documentoIdentidad' => $i['dni_masked'],
                'email' => $i['email'],
                'telefono' => $i['telefono'],
                'categoria' => $i['categoria'],
                'modalidad' => $i['modalidad'],
                'esDobles' => (bool)$i['es_dobles'],
                'esGrupal' => (bool)$i['es_grupal'],
                'nombreEquipo' => $i['nombre_equipo'],
                'fotoEquipo' => $i['foto_equipo'],
                'integrantes' => !empty($i['integrantes']) ? json_decode($i['integrantes'], true) : [],
                'jugador1' => !empty($i['jugador1']) ? json_decode($i['jugador1'], true) : null,
                'jugador2' => !empty($i['jugador2']) ? json_decode($i['jugador2'], true) : ($i['es_dobles'] ? ['nombre' => $i['nombre2'], 'dni' => $i['dni_masked2']] : null),
                'jugador3' => !empty($i['jugador3']) ? json_decode($i['jugador3'], true) : null,
                'jugador4' => !empty($i['jugador4']) ? json_decode($i['jugador4'], true) : null,
                'jugador5' => !empty($i['jugador5']) ? json_decode($i['jugador5'], true) : null,
                'estadoPago' => $i['estado_pago'],
                'metodoPago' => $i['metodo_pago'],
                'comprobanteUrl' => $i['comprobante_url'],
                'comprobanteInfo' => $i['comprobante_info'],
                'fechaRegistro' => $i['fecha_registro']
            ];
        }, $inscriptions);

        return [
            'id' => $t['id'],
            'title' => $t['title'],
            'slug' => $t['slug'],
            'estado' => $t['estado'],
            'modalidad' => $t['modalidad'],
            'categoria' => $t['categoria'],
            'fechas' => $t['fechas_display'],
            'date' => $t['fechas_display'],
            'fechaInicio' => $t['fecha_inicio'],
            'fechaFin' => $t['fecha_fin'],
            'sede' => $t['sede'],
            'place' => $t['sede'],
            'direccion' => $t['direccion'],
            'superficie' => $t['superficie'],
            'precio' => (float)$t['precio'],
            'precioDisplay' => $t['precio_display'],
            'premio' => $t['premio'],
            'imagen' => $t['imagen_url'],
            'image' => $t['imagen_url'],
            'descripcion' => $t['descripcion'],
            'esDestacado' => (bool)$t['es_destacado'],
            'categorias' => !empty($t['categorias_cupos']) ? json_decode($t['categorias_cupos'], true) : [],
            'grupos' => !empty($t['grupos']) ? json_decode($t['grupos'], true) : [],
            'faseGrupos' => !empty($t['fase_grupos']) ? json_decode($t['fase_grupos'], true) : [],
            'bracket' => !empty($t['bracket']) ? json_decode($t['bracket'], true) : null,
            'inscripciones' => $mappedInsc
        ];
    }, $tournaments);

    Database::jsonResponse($result);
}

if ($path === 'tournaments' && $method === 'POST') {
    Database::requireAdmin();
    $id = $body['id'] ?? ('torneo-' . time());
    $title = trim($body['title'] ?? 'Nuevo Torneo ATAP');
    $slug = $body['slug'] ?? strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
    $modalidad = $body['modalidad'] ?? 'singles';

    $stmt = $pdo->prepare('INSERT INTO tournaments (id, title, slug, estado, modalidad, categoria, fechas_display, fecha_inicio, fecha_fin, sede, direccion, superficie, precio, precio_display, premio, imagen_url, descripcion, es_destacado, categorias_cupos, grupos, fase_grupos, bracket) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $id,
        $title,
        $slug,
        $body['estado'] ?? 'abierto',
        $modalidad,
        $body['categoria'] ?? '4ta',
        $body['fechas'] ?? $body['fechasDisplay'] ?? $body['date'] ?? '',
        $body['fechaInicio'] ?? null,
        $body['fechaFin'] ?? null,
        $body['sede'] ?? $body['place'] ?? 'Lima, Perú',
        $body['direccion'] ?? '',
        $body['superficie'] ?? 'Arcilla / Polvo de Ladrillo',
        (float)($body['precio'] ?? 80),
        $body['precioDisplay'] ?? ('S/ ' . ($body['precio'] ?? 80) . '.00'),
        $body['premio'] ?? '',
        $body['imagen'] ?? $body['imagenUrl'] ?? $body['image'] ?? '/assets/apertura.jpg',
        $body['descripcion'] ?? '',
        !empty($body['esDestacado']) ? 1 : 0,
        json_encode($body['categorias'] ?? $body['categoriasCupos'] ?? []),
        json_encode($body['grupos'] ?? []),
        json_encode($body['faseGrupos'] ?? []),
        !empty($body['bracket']) ? json_encode($body['bracket']) : null
    ]);

    Database::jsonResponse(['message' => 'Torneo creado exitosamente en SiteGround MySQL.', 'id' => $id], 201);
}

if (preg_match('#^tournaments/([^/]+)$#', $path, $matches)) {
    $tourneyId = $matches[1];

    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT * FROM tournaments WHERE id = ?');
        $stmt->execute([$tourneyId]);
        $t = $stmt->fetch();
        if (!$t) Database::jsonResponse(['error' => 'Torneo no encontrado.'], 404);

        $inscStmt = $pdo->prepare('SELECT * FROM inscriptions WHERE tournament_id = ? ORDER BY created_at ASC');
        $inscStmt->execute([$tourneyId]);
        $inscriptions = $inscStmt->fetchAll();

        $t['categorias'] = !empty($t['categorias_cupos']) ? json_decode($t['categorias_cupos'], true) : [];
        $t['grupos'] = !empty($t['grupos']) ? json_decode($t['grupos'], true) : [];
        $t['faseGrupos'] = !empty($t['fase_grupos']) ? json_decode($t['fase_grupos'], true) : [];
        $t['bracket'] = !empty($t['bracket']) ? json_decode($t['bracket'], true) : null;
        $t['inscripciones'] = array_map(function($i) {
            return [
                'id' => $i['id'],
                'nombre' => $i['nombre'],
                'name' => $i['nombre'],
                'dni' => $i['dni_masked'],
                'documentoIdentidad' => $i['dni_masked'],
                'email' => $i['email'],
                'telefono' => $i['telefono'],
                'categoria' => $i['categoria'],
                'modalidad' => $i['modalidad'],
                'esDobles' => (bool)$i['es_dobles'],
                'esGrupal' => (bool)$i['es_grupal'],
                'nombreEquipo' => $i['nombre_equipo'],
                'fotoEquipo' => $i['foto_equipo'],
                'integrantes' => !empty($i['integrantes']) ? json_decode($i['integrantes'], true) : [],
                'estadoPago' => $i['estado_pago'],
                'metodoPago' => $i['metodo_pago'],
                'fechaRegistro' => $i['fecha_registro']
            ];
        }, $inscriptions);

        Database::jsonResponse($t);
    }

    if ($method === 'PUT') {
        Database::requireAdmin();
        $fields = [];
        $params = [];

        if (isset($body['title'])) { $fields[] = 'title = ?'; $params[] = $body['title']; }
        if (isset($body['estado'])) { $fields[] = 'estado = ?'; $params[] = $body['estado']; }
        if (isset($body['modalidad'])) { $fields[] = 'modalidad = ?'; $params[] = $body['modalidad']; }
        if (isset($body['categoria'])) { $fields[] = 'categoria = ?'; $params[] = $body['categoria']; }
        if (isset($body['fechas']) || isset($body['date'])) { $fields[] = 'fechas_display = ?'; $params[] = $body['fechas'] ?? $body['date']; }
        if (isset($body['sede']) || isset($body['place'])) { $fields[] = 'sede = ?'; $params[] = $body['sede'] ?? $body['place']; }
        if (isset($body['precio'])) {
            $fields[] = 'precio = ?'; $params[] = (float)$body['precio'];
            $fields[] = 'precio_display = ?'; $params[] = $body['precioDisplay'] ?? ('S/ ' . (float)$body['precio'] . '.00');
        }
        if (isset($body['categorias']) || isset($body['categoriasCupos'])) { $fields[] = 'categorias_cupos = ?'; $params[] = json_encode($body['categorias'] ?? $body['categoriasCupos']); }
        if (isset($body['grupos'])) { $fields[] = 'grupos = ?'; $params[] = json_encode($body['grupos']); }
        if (isset($body['faseGrupos'])) { $fields[] = 'fase_grupos = ?'; $params[] = json_encode($body['faseGrupos']); }
        if (isset($body['bracket'])) { $fields[] = 'bracket = ?'; $params[] = json_encode($body['bracket']); }
        if (isset($body['image']) || isset($body['imagen']) || isset($body['imagenUrl'])) {
            $fields[] = 'imagen_url = ?';
            $params[] = $body['image'] ?? $body['imagen'] ?? $body['imagenUrl'];
        }

        if (!empty($fields)) {
            $params[] = $tourneyId;
            $upd = $pdo->prepare('UPDATE tournaments SET ' . implode(', ', $fields) . ' WHERE id = ?');
            $upd->execute($params);
        }

        Database::jsonResponse(['message' => 'Torneo actualizado correctamente en SiteGround.']);
    }

    if ($method === 'DELETE') {
        Database::requireAdmin();
        $del = $pdo->prepare('DELETE FROM tournaments WHERE id = ?');
        $del->execute([$tourneyId]);
        Database::jsonResponse(['message' => 'Torneo eliminado correctamente.']);
    }
}

// -----------------------------------------------------------------------------
// 4. INSCRIPCIONES (/inscriptions)
// -----------------------------------------------------------------------------
if (preg_match('#^inscriptions/([^/]+)$#', $path, $matches) && $method === 'POST') {
    $tournamentId = $matches[1];
    $nombre = trim($body['nombre'] ?? '');
    $dni = trim($body['dni'] ?? '');

    if (empty($nombre) || empty($dni)) {
        Database::jsonResponse(['error' => 'El nombre y DNI del jugador o capitán son obligatorios.'], 400);
    }

    $inscId = 'insc-' . time() . '-' . substr(md5(uniqid()), 0, 5);
    $maskedDni = Database::maskDni($dni);
    $dHash = hash('sha256', preg_replace('/\s+/', '', $dni));
    $isDobles = !empty($body['esDobles']) || ($body['modalidad'] ?? '') === 'dobles';
    $isGrupal = !empty($body['esGrupal']) || ($body['modalidad'] ?? '') === 'grupal' || ($body['modalidad'] ?? '') === 'equipos';

    $stmt = $pdo->prepare('INSERT INTO inscriptions (
        id, tournament_id, nombre, dni_masked, dni_hash, email, telefono, categoria, modalidad,
        es_dobles, nombre2, dni_masked2, es_grupal, nombre_equipo, foto_equipo, integrantes,
        jugador1, jugador2, jugador3, jugador4, jugador5, estado_pago, metodo_pago, comprobante_info, fecha_registro
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

    $stmt->execute([
        $inscId,
        $tournamentId,
        $nombre,
        $maskedDni,
        $dHash,
        $body['email'] ?? '',
        $body['telefono'] ?? '',
        $body['categoria'] ?? '4ta',
        $isGrupal ? 'grupal' : ($isDobles ? 'dobles' : 'singles'),
        $isDobles ? 1 : 0,
        $body['nombreJugador2'] ?? $body['nombre2'] ?? null,
        !empty($body['dniJugador2']) ? Database::maskDni($body['dniJugador2']) : null,
        $isGrupal ? 1 : 0,
        $body['nombreEquipo'] ?? null,
        $body['fotoEquipo'] ?? null,
        !empty($body['integrantes']) ? json_encode($body['integrantes']) : null,
        !empty($body['jugador1']) ? json_encode($body['jugador1']) : null,
        !empty($body['jugador2']) ? json_encode($body['jugador2']) : null,
        !empty($body['jugador3']) ? json_encode($body['jugador3']) : null,
        !empty($body['jugador4']) ? json_encode($body['jugador4']) : null,
        !empty($body['jugador5']) ? json_encode($body['jugador5']) : null,
        $body['estadoPago'] ?? 'pendiente',
        $body['metodoPago'] ?? 'Yape',
        $body['comprobanteInfo'] ?? '',
        date('Y-m-d')
    ]);

    Database::jsonResponse([
        'message' => 'Inscripción guardada exitosamente en SiteGround MySQL.',
        'inscriptionId' => $inscId
    ], 201);
}

if (preg_match('#^inscriptions/([^/]+)/status$#', $path, $matches) && ($method === 'PATCH' || $method === 'PUT')) {
    Database::requireAdmin();
    $inscId = $matches[1];
    $estadoPago = $body['estadoPago'] ?? 'aprobado';

    $upd = $pdo->prepare('UPDATE inscriptions SET estado_pago = ? WHERE id = ?');
    $upd->execute([$estadoPago, $inscId]);

    Database::jsonResponse(['message' => "Estado de pago actualizado a $estadoPago."]);
}

if (preg_match('#^inscriptions/([^/]+)$#', $path, $matches) && $method === 'DELETE') {
    Database::requireAdmin();
    $inscId = $matches[1];
    $del = $pdo->prepare('DELETE FROM inscriptions WHERE id = ?');
    $del->execute([$inscId]);
    Database::jsonResponse(['message' => 'Inscripción eliminada correctamente.']);
}

// -----------------------------------------------------------------------------
// 5. FIXTURES Y MARCADORES (/fixtures)
// -----------------------------------------------------------------------------
if (preg_match('#^fixtures/([^/]+)/groups$#', $path, $matches) && $method === 'PUT') {
    Database::requireAdmin();
    $tournamentId = $matches[1];
    $gruposArr = $body['grupos'] ?? [];

    // Validar modalidad grupal / por equipos
    $stmtT = $pdo->prepare('SELECT modalidad FROM tournaments WHERE id = ?');
    $stmtT->execute([$tournamentId]);
    $tourneyData = $stmtT->fetch();
    $isGrupalTourney = $tourneyData && in_array(strtolower($tourneyData['modalidad'] ?? ''), ['grupal', 'equipos']);

    if ($isGrupalTourney && is_array($gruposArr)) {
        foreach ($gruposArr as $grp) {
            $grpName = $grp['nombre'] ?? 'Grupo';
            $partidos = $grp['partidos'] ?? [];

            foreach ($partidos as $m) {
                $subtipo = $m['subtipo'] ?? '';
                $mod = strtolower($m['modalidad'] ?? '');
                $p1 = $m['player1'] ?? null;
                $p2 = $m['player2'] ?? null;
                $p1b = $m['player1b'] ?? null;
                $p2b = $m['player2b'] ?? null;

                if ($mod === 'singles' || strpos(strtolower($subtipo), 'singles') !== false) {
                    if ($p1 && $p2) {
                        $p1Id = $p1['id'] ?? null;
                        $p2Id = $p2['id'] ?? null;
                        $p1Name = strtolower(trim($p1['name'] ?? $p1['nombre'] ?? ''));
                        $p2Name = strtolower(trim($p2['name'] ?? $p2['nombre'] ?? ''));

                        if (($p1Id && $p2Id && $p1Id === $p2Id) || ($p1Name && $p2Name && $p1Name === $p2Name)) {
                            Database::jsonResponse([
                                'error' => "En {$grpName}, el partido #{$m['matchNum']} tiene al mismo jugador en ambos lados."
                            ], 400);
                        }
                    }
                } elseif ($mod === 'dobles' || strpos(strtolower($subtipo), 'dobles') !== false) {
                    $assigned = [];
                    foreach ([$p1, $p1b, $p2, $p2b] as $slotPlayer) {
                        if (!$slotPlayer) continue;
                        $id = $slotPlayer['id'] ?? null;
                        $name = strtolower(trim($slotPlayer['name'] ?? $slotPlayer['nombre'] ?? ''));
                        $key = $id ? "id_{$id}" : "name_{$name}";
                        if ($key !== 'name_' && in_array($key, $assigned)) {
                            Database::jsonResponse([
                                'error' => "En {$grpName}, el partido de Dobles #{$m['matchNum']} tiene jugadores repetidos en las duplas."
                            ], 400);
                        }
                        if ($key !== 'name_') {
                            $assigned[] = $key;
                        }
                    }
                }
            }
        }
    }

    $grupos = json_encode($gruposArr);
    $upd = $pdo->prepare('UPDATE tournaments SET grupos = ?, fase_grupos = ? WHERE id = ?');
    $upd->execute([$grupos, $grupos, $tournamentId]);
    Database::jsonResponse(['message' => 'Grupos actualizados correctamente en SiteGround.']);
}

if (preg_match('#^fixtures/([^/]+)/bracket$#', $path, $matches) && $method === 'PUT') {
    Database::requireAdmin();
    $tournamentId = $matches[1];
    $bracket = json_encode($body['bracket'] ?? []);
    $upd = $pdo->prepare('UPDATE tournaments SET bracket = ? WHERE id = ?');
    $upd->execute([$bracket, $tournamentId]);
    Database::jsonResponse(['message' => 'Cuadro eliminatorio actualizado correctamente.']);
}

if (preg_match('#^fixtures/([^/]+)/matches/([^/]+)/score$#', $path, $matches) && $method === 'POST') {
    Database::requireAdmin();
    $tournamentId = $matches[1];
    $matchId = $matches[2];
    $score = $body['score'] ?? '';
    $winnerSlot = $body['winnerSlot'] ?? null;
    $pointsAward = (int)($body['pointsAward'] ?? 100);

    // Obtener bracket y fase_grupos
    $stmt = $pdo->prepare('SELECT bracket, fase_grupos FROM tournaments WHERE id = ?');
    $stmt->execute([$tournamentId]);
    $t = $stmt->fetch();

    if (!$t) Database::jsonResponse(['error' => 'Torneo no encontrado.'], 404);

    $bracket = !empty($t['bracket']) ? json_decode($t['bracket'], true) : [];
    $faseGrupos = !empty($t['fase_grupos']) ? json_decode($t['fase_grupos'], true) : [];
    $winnerName = null;
    $found = false;

    // 1. Buscar en rondas eliminatorias
    if (!empty($bracket['rounds'])) {
        foreach ($bracket['rounds'] as &$round) {
            if (!empty($round['matches'])) {
                foreach ($round['matches'] as &$match) {
                    if ($match['id'] === $matchId) {
                        $match['score'] = $score;
                        $match['status'] = 'finalizado';
                        $winner = $winnerSlot == 1 ? ($match['player1'] ?? null) : ($match['player2'] ?? null);
                        $winnerName = $winner['name'] ?? $winner['nombre'] ?? null;
                        $match['winner'] = $winnerName;
                        if (($round['roundName'] ?? '') === 'Final') {
                            $bracket['champion'] = $winner;
                        }
                        $found = true;
                        break 2;
                    }
                }
            }
        }
    }

    // 2. Buscar en fase de grupos
    if (!$found && !empty($faseGrupos)) {
        foreach ($faseGrupos as &$grupo) {
            if (!empty($grupo['partidos'])) {
                foreach ($grupo['partidos'] as &$match) {
                    if ($match['id'] === $matchId) {
                        $match['score'] = $score;
                        $match['status'] = 'finalizado';
                        $winner = $winnerSlot == 1 ? ($match['player1'] ?? null) : ($match['player2'] ?? null);
                        $winnerName = $winner['name'] ?? $winner['nombre'] ?? null;
                        $match['winner'] = $winnerName;
                        $found = true;
                        break 2;
                    }
                }
            }
        }
    }

    // Guardar actualización en BD
    $upd = $pdo->prepare('UPDATE tournaments SET bracket = ?, fase_grupos = ? WHERE id = ?');
    $upd->execute([json_encode($bracket), json_encode($faseGrupos), $tournamentId]);

    // Sumar puntos en tabla de ranking al ganador
    if ($winnerName && $pointsAward > 0) {
        $cleanWinner = trim($winnerName);
        $rankStmt = $pdo->prepare('SELECT id, puntos_num FROM ranking WHERE LOWER(TRIM(name)) = LOWER(?)');
        $rankStmt->execute([$cleanWinner]);
        $playerRank = $rankStmt->fetch();

        if ($playerRank) {
            $newPts = (int)$playerRank['puntos_num'] + $pointsAward;
            $updRank = $pdo->prepare('UPDATE ranking SET puntos_num = ?, points_str = ? WHERE id = ?');
            $updRank->execute([$newPts, number_format($newPts) . ' pts', $playerRank['id']]);
        }
    }

    Database::jsonResponse([
        'message' => 'Resultado registrado y puntos de ranking sumados en SiteGround.',
        'bracket' => $bracket,
        'faseGrupos' => $faseGrupos
    ]);
}

// -----------------------------------------------------------------------------
// 6. RANKING (/ranking)
// -----------------------------------------------------------------------------
if ($path === 'ranking' && $method === 'GET') {
    $categoria = $_GET['categoria'] ?? null;
    $modalidad = $_GET['modalidad'] ?? 'singles';

    $sql = 'SELECT * FROM ranking WHERE 1=1';
    $params = [];
    if ($categoria) {
        $sql .= ' AND categoria = ?';
        $params[] = $categoria;
    }
    if ($modalidad) {
        $sql .= ' AND modalidad = ?';
        $params[] = $modalidad;
    }
    $sql .= ' ORDER BY puntos_num DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $players = $stmt->fetchAll();

    Database::jsonResponse(array_map(function($p) {
        return [
            'id' => $p['id'],
            'name' => $p['name'],
            'dni' => $p['dni_masked'],
            'categoria' => $p['categoria'],
            'modalidad' => $p['modalidad'],
            'puntosNum' => (int)$p['puntos_num'],
            'points' => $p['points_str'],
            'titulos' => (int)$p['titulos'],
            'efectividad' => $p['efectividad'],
            'mano' => $p['mano_dominante'],
            'golpe' => $p['mejor_golpe'],
            'image' => $p['avatar_url']
        ];
    }, $players));
}

// -----------------------------------------------------------------------------
// 7. CONTENIDO Y AJUSTES (/content)
// -----------------------------------------------------------------------------
if ($path === 'content/settings/atap_yape_config') {
    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT setting_value FROM site_settings WHERE setting_key = "atap_yape_config"');
        $stmt->execute();
        $row = $stmt->fetch();
        if ($row && !empty($row['setting_value'])) {
            Database::jsonResponse(json_decode($row['setting_value'], true));
        } else {
            Database::jsonResponse([
                'numero' => '962 168 953',
                'numeroRaw' => '962168953',
                'titular' => 'DOMINGUEZ ALBINES ALVARO RAFAEL',
                'ruc' => '10722166634',
                'entidad' => 'Asociación de Tenistas Amateur del Perú'
            ]);
        }
    }

    if ($method === 'PUT') {
        Database::requireAdmin();
        $val = json_encode($body['value'] ?? $body);
        $stmt = $pdo->prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES ("atap_yape_config", ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
        $stmt->execute([$val]);
        Database::jsonResponse(['message' => 'Configuración de Yape actualizada en SiteGround MySQL.']);
    }
}

if (preg_match('#^content/settings/([^/]+)$#', $path, $matches)) {
    $key = $matches[1];
    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?');
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        Database::jsonResponse($row && !empty($row['setting_value']) ? json_decode($row['setting_value'], true) : null);
    }
    if ($method === 'PUT') {
        Database::requireAdmin();
        $val = json_encode($body['value'] ?? $body);
        $stmt = $pdo->prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
        $stmt->execute([$key, $val]);
        Database::jsonResponse(['message' => "Ajuste $key guardado en SiteGround."]);
    }
}

// -----------------------------------------------------------------------------
// 8. SUBIDA DE ARCHIVOS / IMÁGENES (/upload)
// -----------------------------------------------------------------------------
if ($path === 'upload' && $method === 'POST') {
    if (empty($_FILES['file']) && empty($_FILES['image'])) {
        Database::jsonResponse(['error' => 'No se recibió ningún archivo de imagen.'], 400);
    }
    $uploadedFile = $_FILES['file'] ?? $_FILES['image'];
    if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
        Database::jsonResponse(['error' => 'Error al procesar la subida del archivo.'], 400);
    }

    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $ext = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExts)) {
        Database::jsonResponse(['error' => 'Formato no soportado. Solo se permiten JPG, PNG, WEBP o GIF.'], 400);
    }

    $filename = 'img_' . time() . '_' . substr(md5(uniqid()), 0, 8) . '.' . $ext;
    $uploadDir = dirname(__DIR__) . '/uploads';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }
    $targetPath = $uploadDir . '/' . $filename;

    if (move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
        Database::jsonResponse([
            'message' => 'Imagen subida correctamente al servidor.',
            'url' => '/uploads/' . $filename,
            'filename' => $filename
        ]);
    } else {
        Database::jsonResponse(['error' => 'No se pudo guardar la imagen en el directorio de subidas.'], 500);
    }
}

// -----------------------------------------------------------------------------
// 9. GESTIÓN COMPLETA DE NOTICIAS (/content/news)
// -----------------------------------------------------------------------------
if ($path === 'content/news' && $method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM news ORDER BY created_at DESC');
    Database::jsonResponse($stmt->fetchAll());
}

if ($path === 'content/news' && $method === 'POST') {
    Database::requireAdmin();
    $newsId = $body['id'] ?? ('news-' . time());
    $title = trim($body['title'] ?? '');
    $summary = $body['summary'] ?? '';
    $content = $body['content'] ?? '';
    $category = $body['category'] ?? 'Institucional';
    $imageUrl = $body['imageUrl'] ?? $body['image'] ?? '/assets/Evento.png';
    $author = $body['author'] ?? 'Comité ATAP';
    $dateDisplay = $body['dateDisplay'] ?? $body['date'] ?? date('d M Y');
    $featured = !empty($body['featured']) ? 1 : 0;

    $stmt = $pdo->prepare('INSERT INTO news (id, title, summary, content, category, image_url, author, date_display, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), summary = VALUES(summary), content = VALUES(content), category = VALUES(category), image_url = VALUES(image_url), author = VALUES(author), date_display = VALUES(date_display), featured = VALUES(featured)');
    $stmt->execute([$newsId, $title, $summary, $content, $category, $imageUrl, $author, $dateDisplay, $featured]);
    Database::jsonResponse(['message' => 'Noticia guardada en SiteGround.', 'id' => $newsId]);
}

if (preg_match('#^content/news/([^/]+)$#', $path, $matches) && $method === 'DELETE') {
    Database::requireAdmin();
    $del = $pdo->prepare('DELETE FROM news WHERE id = ?');
    $del->execute([$matches[1]]);
    Database::jsonResponse(['message' => 'Noticia eliminada correctamente.']);
}

// -----------------------------------------------------------------------------
// 10. GESTIÓN COMPLETA DE AUSPICIADORES (/content/sponsors)
// -----------------------------------------------------------------------------
if ($path === 'content/sponsors' && $method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM sponsors ORDER BY order_index ASC');
    Database::jsonResponse($stmt->fetchAll());
}

if ($path === 'content/sponsors' && $method === 'POST') {
    Database::requireAdmin();
    $sponsorId = $body['id'] ?? ('sp-' . time());
    $name = trim($body['name'] ?? '');
    $category = $body['category'] ?? 'Equipamiento';
    $logoUrl = $body['logoUrl'] ?? $body['logo'] ?? '/assets/logo.png';
    $link = $body['link'] ?? '';
    $desc = $body['description'] ?? '';
    $active = isset($body['active']) ? (int)(bool)$body['active'] : 1;
    $orderIndex = (int)($body['orderIndex'] ?? $body['order'] ?? 0);

    $stmt = $pdo->prepare('INSERT INTO sponsors (id, name, category, logo_url, link, description, active, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), logo_url = VALUES(logo_url), link = VALUES(link), description = VALUES(description), active = VALUES(active), order_index = VALUES(order_index)');
    $stmt->execute([$sponsorId, $name, $category, $logoUrl, $link, $desc, $active, $orderIndex]);
    Database::jsonResponse(['message' => 'Auspiciador guardado en SiteGround.', 'id' => $sponsorId]);
}

if (preg_match('#^content/sponsors/([^/]+)$#', $path, $matches) && $method === 'DELETE') {
    Database::requireAdmin();
    $del = $pdo->prepare('DELETE FROM sponsors WHERE id = ?');
    $del->execute([$matches[1]]);
    Database::jsonResponse(['message' => 'Auspiciador eliminado correctamente.']);
}

// -----------------------------------------------------------------------------
// 11. LISTA DE JUGADORES (/players)
// -----------------------------------------------------------------------------
if ($path === 'players' && $method === 'GET') {
    $stmt = $pdo->query('SELECT id, nombre, email, dni_masked, telefono, categoria, rol, avatar_url FROM users ORDER BY nombre ASC');
    Database::jsonResponse($stmt->fetchAll());
}

// -----------------------------------------------------------------------------
// 12. ACTUALIZAR AVATAR DE JUGADOR (/players/:id/avatar)
// -----------------------------------------------------------------------------
if (preg_match('#^players/([^/]+)/avatar$#', $path, $matches) && ($method === 'PATCH' || $method === 'PUT')) {
    $playerId = $matches[1];
    $avatarUrl = $body['avatarUrl'] ?? $body['avatar'] ?? '/assets/logo.png';

    $updUser = $pdo->prepare('UPDATE users SET avatar_url = ? WHERE id = ?');
    $updUser->execute([$avatarUrl, $playerId]);

    $updRank = $pdo->prepare('UPDATE ranking SET avatar_url = ? WHERE user_id = ? OR id = ?');
    $updRank->execute([$avatarUrl, $playerId, $playerId]);

    Database::jsonResponse(['message' => 'Avatar actualizado en SiteGround.', 'avatarUrl' => $avatarUrl]);
}

// -----------------------------------------------------------------------------
// RUTA NO ENCONTRADA
// -----------------------------------------------------------------------------
Database::jsonResponse(['error' => "Endpoint '/api/$path' no encontrado en el servidor."], 404);

