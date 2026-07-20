<?php
/**
 * Book a Free Trial — form handler.
 *
 * Receives the trial-booking form (see BookTrialModal in src/App.jsx),
 * validates it, saves it to the `bookings` table (see schema.sql), and
 * emails the submission to the academy inbox. The database save and the
 * email are independent — if one fails the other still goes through, so a
 * booking is only ever lost if BOTH the database and the email are down.
 *
 * SETUP — see SETUP.md. You need: (1) a MySQL database with schema.sql run
 * against it, with real credentials filled into db.php, and (2) a real
 * info@speakinurdu.com mailbox created in hPanel for the email to send.
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
$age = field("age", 3);
$gender = field("gender", 40);
$country = field("country", 80);
$timezone = field("timezone", 80);
$classTime = field("classTime", 200);
$course = field("course", 120);
$eventId = field("eventId", 100); // shared with the browser pixel's Lead event, for CAPI dedup

$required = compact("name", "email", "phone", "age", "gender", "country", "timezone", "course");
foreach ($required as $key => $value) {
  if ($value === "") {
    fail(422, "Missing required field: $key");
  }
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  fail(422, "Invalid email address.");
}

if (!preg_match('/^[+\d][\d\s()-]{6,}$/', $phone)) {
  fail(422, "Invalid phone number.");
}

$ageNum = (int)$age;
if ($ageNum < 5 || $ageNum > 99) {
  fail(422, "Invalid age.");
}

// Save the permanent record first — this is the part that must not silently
// disappear if email delivery has a bad day.
$dbSaved = false;
$pdo = db_connect();
if ($pdo) {
  try {
    $stmt = $pdo->prepare(
      "INSERT INTO bookings (name, email, phone, age, gender, country, timezone, class_time, course)
       VALUES (:name, :email, :phone, :age, :gender, :country, :timezone, :class_time, :course)"
    );
    $stmt->execute([
      ":name" => $name, ":email" => $email, ":phone" => $phone, ":age" => $ageNum, ":gender" => $gender,
      ":country" => $country, ":timezone" => $timezone, ":class_time" => $classTime, ":course" => $course,
    ]);
    $dbSaved = true;
  } catch (Throwable $e) {
    error_log("Booking DB insert failed: " . $e->getMessage());
  }
}

$subject = "New trial booking: $name ($course)";

$body = <<<TEXT
New free trial request from the website.

Name:              $name
Email:              $email
Phone:              $phone
Age:                $ageNum
Gender:             $gender
Country:            $country
Timezone:           $timezone
Preferred time:     {$classTime}
Course:             $course

Reply to this email to reach the student directly.
TEXT;

$headers = [
  "From: Speak in Urdu <" . FROM_EMAIL . ">",
  "Reply-To: $name <$email>",
  "Content-Type: text/plain; charset=UTF-8",
];

$mailSent = mail(RECIPIENT_EMAIL, $subject, $body, implode("\r\n", $headers));

if (!$dbSaved && !$mailSent) {
  fail(500, "Could not save or send the booking. Please try again later.");
}

capi_respond_then_continue(function () {
  echo json_encode(["success" => true]);
});

send_capi_event(
  "Lead",
  ["email" => $email, "phone" => $phone, "first_name" => $name],
  ["content_name" => $course],
  $eventId ?: null
);
