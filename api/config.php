<?php
/**
 * Configuración de Base de Datos para ATAP en SiteGround
 * Modifica estos valores con las credenciales que creaste en "Gestor MySQL" de SiteGround.
 */

// Host de la base de datos (en SiteGround casi siempre es 'localhost')
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');

// Nombre de la base de datos creada en SiteGround (ejemplo: 'u123456789_atap')
define('DB_NAME', getenv('DB_NAME') ?: 'atap_db');

// Usuario de la base de datos creado en SiteGround
define('DB_USER', getenv('DB_USER') ?: 'root');

// Contraseña del usuario de la base de datos
define('DB_PASS', getenv('DB_PASS') ?: '');

// Juego de caracteres
define('DB_CHARSET', 'utf8mb4');

// Clave secreta para la firma segura de tokens JWT
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'atap_jwt_super_secret_circuit_amateur_tenis_peru_2026');

// Origen permitido para CORS (o '*' para permitir llamadas de la web)
define('CORS_ORIGIN', '*');
