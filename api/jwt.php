<?php
/**
 * Utilidad liviana de generación y verificación de JWT (JSON Web Tokens) en PHP puro
 * Sin dependencias externas para compatibilidad inmediata en SiteGround
 */

class SimpleJWT {
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public static function sign($payload, $secret, $expireSeconds = 2592000) { // 30 días
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['iat'] = time();
        $payload['exp'] = time() + $expireSeconds;
        $payloadJson = json_encode($payload);

        $base64Header = self::base64UrlEncode($header);
        $base64Payload = self::base64UrlEncode($payloadJson);

        $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, $secret, true);
        $base64Signature = self::base64UrlEncode($signature);

        return $base64Header . '.' . $base64Payload . '.' . $base64Signature;
    }

    public static function verify($token, $secret) {
        if (!$token) return null;
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        list($base64Header, $base64Payload, $base64Signature) = $parts;

        $signature = self::base64UrlDecode($base64Signature);
        $expectedSignature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, $secret, true);

        if (!hash_equals($signature, $expectedSignature)) {
            return null; // Firma inválida
        }

        $payload = json_decode(self::base64UrlDecode($base64Payload), true);
        if (!$payload) return null;

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Token expirado
        }

        return $payload;
    }
}
