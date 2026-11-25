<?php
/**
 * Techventics contact form endpoint (cPanel / any PHP host).
 *
 * Receives the JSON the Contact page sends, validates it with the same rules as the
 * browser (lib/contactSchema.ts), drops spam, and emails the enquiry with PHP mail(),
 * which cPanel delivers through its own mail server. No passwords are stored here.
 *
 * Responses (JSON):
 *   200 { ok: true }                       sent (or silently dropped as spam)
 *   422 { ok: false, errors: {field: msg} } validation failed
 *   400 / 403 / 405 / 429 / 500 { ok: false, error: "..." }
 */

// ── Settings ────────────────────────────────────────────────────────────────
// Where enquiries go. Must be a real mailbox or forwarder in cPanel.
const CONTACT_TO = 'Info@techventics.com';
// Sender address: use a real mailbox on this domain so SPF/DKIM pass.
const CONTACT_FROM = 'techandk@techventics.com';
const CONTACT_FROM_NAME = 'Techventics Website';
// Spam controls
const MIN_FILL_MS = 2500;            // faster than this is almost certainly a bot
const RATE_LIMIT_MAX = 5;            // messages per IP…
const RATE_LIMIT_WINDOW = 600;       // …per 10 minutes
// ────────────────────────────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

// Same-site check: browsers send Origin on POST; reject posts from other websites.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $host = preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? '');
    if (!$originHost || strcasecmp($originHost, $host) !== 0) {
        respond(403, ['ok' => false, 'error' => 'Forbidden.']);
    }
}

$raw = file_get_contents('php://input', false, null, 0, 20000);
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'error' => 'Invalid request.']);
}

$str = static function ($key) use ($data): string {
    $v = $data[$key] ?? '';
    return is_string($v) ? trim($v) : '';
};
$len = static fn(string $s): int => function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);

$name    = $str('name');
$email   = $str('email');
$company = $str('company');
$service = $str('service');
$budget  = $str('budget');
$message = $str('message');
$website = $str('website');                       // honeypot
$started = isset($data['startedAt']) && is_numeric($data['startedAt']) ? (float) $data['startedAt'] : 0;

// ── Validation (same rules and messages as lib/contactSchema.ts) ──────────────
$errors = [];
if ($len($name) < 2) $errors['name'] = 'Please enter your name.';
elseif ($len($name) > 100) $errors['name'] = 'That name is too long.';

if ($len($email) > 200) $errors['email'] = 'That email is too long.';
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Please enter a valid email address.';

if ($len($company) > 120) $errors['company'] = 'That is too long.';
if ($service === '' || $len($service) > 120) $errors['service'] = 'Please choose a service.';
if ($budget === '' || $len($budget) > 120) $errors['budget'] = 'Please choose a budget range.';

if ($len($message) < 20) $errors['message'] = 'A little more detail helps: at least 20 characters.';
elseif ($len($message) > 5000) $errors['message'] = 'Please keep it under 5,000 characters.';

if ($errors) {
    respond(422, ['ok' => false, 'errors' => $errors]);
}

// ── Spam: pretend success so bots learn nothing ──────────────────────────────
$nowMs = microtime(true) * 1000;
if ($website !== '' || ($started > 0 && $nowMs - $started < MIN_FILL_MS)) {
    respond(200, ['ok' => true]);
}

// ── Rate limit per IP (small file in the system temp dir) ─────────────────────
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'tv-contact-' . hash('sha256', $ip);
$hits = [];
if (is_file($bucket)) {
    $hits = array_filter(
        array_map('intval', explode(',', (string) @file_get_contents($bucket))),
        static fn($t) => $t > time() - RATE_LIMIT_WINDOW
    );
}
if (count($hits) >= RATE_LIMIT_MAX) {
    respond(429, ['ok' => false, 'error' => 'Too many messages. Please try again in a few minutes.']);
}
$hits[] = time();
@file_put_contents($bucket, implode(',', $hits), LOCK_EX);

// ── Compose and send ──────────────────────────────────────────────────────────
// Strip anything that could inject extra mail headers.
$clean = static fn(string $s): string => trim(preg_replace('/[\r\n\t]+/', ' ', $s));
$encode = static fn(string $s): string => '=?UTF-8?B?' . base64_encode($s) . '?=';

$subject = 'New enquiry: ' . $clean($name) . ($company !== '' ? ' (' . $clean($company) . ')' : '') . ' · ' . $clean($service);
$body = implode("\n", [
    'Name:    ' . $clean($name),
    'Email:   ' . $clean($email),
    'Company: ' . ($company !== '' ? $clean($company) : '—'),
    'Service: ' . $clean($service),
    'Budget:  ' . $clean($budget),
    '',
    'Message:',
    str_replace("\r\n", "\n", $message),
    '',
    '— Sent from the contact form on ' . ($_SERVER['HTTP_HOST'] ?? 'techventics.com') . '. Reply to this email to answer directly.',
]);

$headers = implode("\r\n", [
    'From: ' . $encode(CONTACT_FROM_NAME) . ' <' . CONTACT_FROM . '>',
    'Reply-To: ' . $encode($clean($name)) . ' <' . $clean($email) . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: techventics.com contact form',
]);

// getenv check lets the local test harness capture mail instead of sending it.
if (getenv('CONTACT_TEST_OUTBOX')) {
    $sent = (bool) file_put_contents(getenv('CONTACT_TEST_OUTBOX'), "To: " . CONTACT_TO . "\r\nSubject: " . $encode($subject) . "\r\n" . $headers . "\r\n\r\n" . $body);
} else {
    $sent = mail(CONTACT_TO, $encode($subject), $body, $headers, '-f' . CONTACT_FROM);
}

if (!$sent) {
    error_log('[contact] mail() failed for enquiry from ' . $clean($email));
    respond(500, ['ok' => false, 'error' => "We couldn't send your message just now. Please email us directly."]);
}

respond(200, ['ok' => true]);
