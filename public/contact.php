<?php
/**
 * Contact form — form handler.
 *
 * Receives the contact form (see ContactPage in src/App.jsx), validates it,
 * saves it to the `contacts` table (see schema.sql), and emails the message
 * to the academy inbox. See the notes in book-trial.php for the full setup.
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

// Honeypot: bots fill every field, real users never see or fill this one.
if (!empty($_POST["website"] ?? "")) {
  echo json_encode(["success" => true]);
  exit;
}

function field(string $key, int $maxLen = 200): string {
  $value = trim((string)($_POST[$key] ?? ""));
  $value = strip_tags($value);
  $value = str_replace(["\r", "\n"], " ", $value);
  return mb_substr($value, 0, $maxLen);
}

$name = field("name", 120);
$email = field("email", 200);
$phone = field("phone", 40);
$timezone = field("tz", 80);
$eventId = field("eventId", 100); // shared with the browser pixel's Contact event, for CAPI dedup

// Message is multi-line, so it's sanitized separately (newlines kept, tags stripped).
$message = trim((string)($_POST["message"] ?? ""));
$message = strip_tags($message);
$message = mb_substr($message, 0, 4000);

foreach (["name" => $name, "email" => $email, "message" => $message] as $key => $value) {
  if ($value === "") {
    fail(422, "Missing required field: $key");
  }
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  fail(422, "Invalid email address.");
}

// Phone is optional here (unlike the booking form) — only validated if given.
if ($phone !== "" && !preg_match('/^[+\d][\d\s()-]{6,}$/', $phone)) {
  fail(422, "Invalid phone number.");
}

$dbSaved = false;
$pdo = db_connect();
if ($pdo) {
  try {
    $stmt = $pdo->prepare(
      "INSERT INTO contacts (name, email, phone, timezone, message) VALUES (:name, :email, :phone, :timezone, :message)"
    );
    $stmt->execute([":name" => $name, ":email" => $email, ":phone" => $phone, ":timezone" => $timezone, ":message" => $message]);
    $dbSaved = true;
  } catch (Throwable $e) {
    error_log("Contact DB insert failed: " . $e->getMessage());
  }
}

$subject = "New contact message from $name";

$body = <<<TEXT
New message from the contact form.

Name:              $name
Email:              $email
Phone:              $phone
Preferred timezone: $timezone

Message:
$message

Reply to this email to reach them directly.
TEXT;

$headers = [
  "From: Speak in Urdu <" . FROM_EMAIL . ">",
  "Reply-To: $name <$email>",
  "Content-Type: text/plain; charset=UTF-8",
];

$mailSent = mail(RECIPIENT_EMAIL, $subject, $body, implode("\r\n", $headers));

if (!$dbSaved && !$mailSent) {
  fail(500, "Could not save or send the message. Please try again later.");
}

capi_respond_then_continue(function () {
  echo json_encode(["success" => true]);
});

send_capi_event(
  "Contact",
  ["email" => $email, "phone" => $phone, "first_name" => $name],
  [],
  $eventId ?: null
);
