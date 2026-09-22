<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/jwt.php';

// Configurar encabezados CORS y JSON
header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

class Database {
    private static $pdo = null;

    public static function getConnection() {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            self::$pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            return self::$pdo;
        } catch (PDOException $e) {
            self::jsonResponse(['error' => 'Error de conexión con MySQL en SiteGround: ' . $e->getMessage()], 500);
            exit;
        }
    }

    public static function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function getRequestBody() {
        $raw = file_get_contents('php://input');
        if (empty($raw)) return [];
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    public static function getBearerToken() {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(\S+)/i', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public static function authenticate() {
        $token = self::getBearerToken();
        if (!$token) {
            self::jsonResponse(['error' => 'Acceso no autorizado. Se requiere token de sesión.'], 401);
        }
        $user = SimpleJWT::verify($token, JWT_SECRET);
        if (!$user) {
            self::jsonResponse(['error' => 'Token inválido o expirado. Inicia sesión nuevamente.'], 401);
        }
        return $user;
    }

    public static function requireAdmin() {
        $user = self::authenticate();
        if (empty($user['es_admin']) && ($user['rol'] ?? '') !== 'Administrador') {
            self::jsonResponse(['error' => 'Permisos insuficientes. Se requiere rol de Administrador.'], 403);
        }
        return $user;
    }

    public static function maskDni($dni) {
        $clean = preg_replace('/\s+/', '', (string)$dni);
        if (strlen($clean) <= 3) return '*****' . $clean;
        return '*****' . substr($clean, -3);
    }
}
