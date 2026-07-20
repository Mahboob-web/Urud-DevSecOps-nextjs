<?php
/**
 * Newsletter signup — form handler.
 *
 * Receives the footer email signup (see Footer in src/App.jsx), saves it to
 * the `newsletter_signups` table (see schema.sql), and emails a notification.
 *
 * This does NOT manage an actual mailing list (no unsubscribe, no bulk
 * sending) — the database table is your list. For real newsletter sending,
 * export it (phpMyAdmin > Export) into a proper list service (Mailchimp,
 * Brevo, etc). See the notes in book-trial.php for the full setup.
 */

define("APP_BOOTSTRAP", true);
require __DIR__ . "/db.php";
require __DIR__ . "/capi.php";

const RECIPIENT_EMAIL = "info@speakinurdu.com";
const FROM_EMAIL = "info@speakinurdu.com";

header("Content-Type: application/json; charset=UTF-8");

function fail(int $status, string $error): void {
  http_response_code($status);
  echo json_encode(["success" => false, "error" => $error]);
  exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  fail(405, "Method not allowed.");
}

if (!empty($_POST["website"] ?? "")) {
  echo json_encode(["success" => true]);
  exit;
}

$email = trim((string)($_POST["email"] ?? ""));
$email = str_replace(["\r", "\n"], "", $email);
$email = mb_substr($email, 0, 200);
$eventId = trim((string)($_POST["eventId"] ?? "")); // shared with the browser pixel's Subscribe event, for CAPI dedup

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  fail(422, "Invalid email address.");
}

$dbSaved = false;
$pdo = db_connect();
if ($pdo) {
  try {
    $stmt = $pdo->prepare("INSERT INTO newsletter_signups (email) VALUES (:email)");
    $stmt->execute([":email" => $email]);
    $dbSaved = true;
  } catch (Throwable $e) {
    error_log("Newsletter DB insert failed: " . $e->getMessage());
  }
}

$subject = "New newsletter signup";
$body = "New newsletter signup from the website footer:\n\n$email";

$headers = [
  "From: Speak in Urdu <" . FROM_EMAIL . ">",
  "Content-Type: text/plain; charset=UTF-8",
];

$mailSent = mail(RECIPIENT_EMAIL, $subject, $body, implode("\r\n", $headers));

if (!$dbSaved && !$mailSent) {
  fail(500, "Could not save or send. Please try again later.");
}

capi_respond_then_continue(function () {
  echo json_encode(["success" => true]);
});

send_capi_event("Subscribe", ["email" => $email], [], $eventId ?: null);
