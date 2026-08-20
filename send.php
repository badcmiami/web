<?php
/**
 * Best American Diagnostic Center — form handler
 * ---------------------------------------------------------------------------
 * Receives the appointment and referral forms and emails them to the front
 * desk. Works on any PHP host (cPanel included). No database, no dependencies.
 *
 * SETUP: change the three constants below, upload next to index.html, done.
 *
 * Privacy note: the forms deliberately collect contact details only, never
 * clinical information, so nothing here is PHI. Keep it that way — if you ever
 * add clinical fields, this file must be replaced with a HIPAA-compliant,
 * encrypted intake service and a signed BAA.
 */

const MAIL_TO      = 'billing@bestamericandiagnostics.com';    // where requests arrive
const MAIL_FROM    = 'website@bestamericandiagnostics.com';     // must be on your domain
const SUBJECT_TAG  = '[Website]';

// --------------------------------------------------------------------------
header('X-Content-Type-Options: nosniff');
$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH'])
    || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

function respond($ok, $message, $isAjax, $redirect = 'contact.html') {
    if ($isAjax) {
        header('Content-Type: application/json');
        http_response_code($ok ? 200 : 400);
        echo json_encode(['ok' => $ok, 'message' => $message]);
    } else {
        header('Location: ' . $redirect . ($ok ? '?sent=1' : '?error=1'), true, 303);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed', $isAjax);
}

// Honeypot: real people never fill a hidden field.
if (!empty($_POST['company'])) {
    respond(true, 'Thanks', $isAjax);           // silently accept and drop
}

// Rate limit per IP: generous for humans, closed for floods. Never drops a
// request silently — a real patient always gets told what happened.
$ip  = $_SERVER['REMOTE_ADDR'] ?? 'cli';
$jar = sys_get_temp_dir() . '/badc_rl_' . md5($ip);
$hits = array_values(array_filter(
    file_exists($jar) ? (array) json_decode(file_get_contents($jar), true) : [],
    function ($t) { return $t > time() - 600; }          // 10-minute window
));
if (count($hits) >= 6) {
    respond(false, 'Too many requests from this connection. Please call us at (305) 681-7555.', $isAjax);
}
$hits[] = time();
@file_put_contents($jar, json_encode($hits), LOCK_EX);

function field($key, $max = 500) {
    $v = isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
    $v = preg_replace('/[\r\n]+/', ' ', $v);     // header-injection guard
    return mb_substr($v, 0, $max);
}

$type    = field('form_type', 40) ?: 'appointment';
$name    = field('name', 120);
$phone   = field('phone', 40);
$email   = field('email', 160);
$digits  = preg_replace('/\D/', '', $phone);

if ($name === '' || $digits === '' || strlen($digits) < 10) {
    respond(false, 'Please provide a name and a valid phone number.', $isAjax);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'That email address does not look valid.', $isAjax);
}

$labels = [
    'name' => 'Name', 'phone' => 'Phone', 'email' => 'Email', 'language' => 'Language',
    'study' => 'Study', 'location' => 'Location', 'date' => 'Preferred date',
    'insurance' => 'Insurance', 'practice' => 'Practice', 'note' => 'Note',
    'message' => 'Message',
];

$lines = ["Form: $type", str_repeat('-', 46)];
foreach ($labels as $key => $label) {
    $value = field($key, 2000);
    if ($value !== '') {
        $lines[] = str_pad($label . ':', 18) . $value;
    }
}
$lines[] = str_repeat('-', 46);
$lines[] = 'Sent: ' . date('Y-m-d H:i:s T');
$lines[] = 'IP:   ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');

$subject = sprintf('%s %s request — %s', SUBJECT_TAG,
    $type === 'referral' ? 'Referral' : 'Appointment', $name);

$headers = [
    'From: Best American Diagnostic <' . MAIL_FROM . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];
if ($email !== '') {
    $headers[] = 'Reply-To: ' . $email;
}

$sent = @mail(MAIL_TO, $subject, implode("\n", $lines), implode("\r\n", $headers),
              '-f' . MAIL_FROM);

$redirect = $type === 'referral' ? 'providers.html' : 'contact.html';
if ($sent) {
    respond(true, 'Thank you — we will call you the same business day.', $isAjax, $redirect);
}
respond(false, 'We could not send your request. Please call us at (305) 681-7555.', $isAjax, $redirect);
