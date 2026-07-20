<?php
/**
 * Generic Conversions API relay for events that happen purely client-side
 * in the React app (course page views, opening the trial modal, SPA
 * navigation) — these have no natural server round-trip of their own
 * (unlike form submissions), so the browser calls this endpoint to get
 * them server-side CAPI coverage too. Fire-and-forget from the client;
 * this never blocks the UI either way.
 */
define("APP_BOOTSTRAP", true);
require __DIR__ . "/blog-lib.php";
require __DIR__ . "/capi.php";

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["success" => false]);
  exit;
}

// Only these client-side events are ever relayed — an allowlist keeps this
// public endpoint from being used to inject arbitrary events into the pixel.
const ALLOWED_EVENTS = ["PageView", "ViewContent", "InitiateCheckout"];

$eventName = (string)($_POST["event"] ?? "");
if (!in_array($eventName, ALLOWED_EVENTS, true)) {
  http_response_code(400);
  echo json_encode(["success" => false]);
  exit;
}

$eventId = trim((string)($_POST["eventId"] ?? ""));
$contentName = trim((string)($_POST["contentName"] ?? ""));
$contentCategory = trim((string)($_POST["contentCategory"] ?? ""));
$contentId = trim((string)($_POST["contentId"] ?? ""));
$sourceUrl = trim((string)($_POST["url"] ?? ""));

$customData = [];
if ($contentName !== "") $customData["content_name"] = mb_substr($contentName, 0, 200);
if ($contentCategory !== "") $customData["content_category"] = mb_substr($contentCategory, 0, 100);
if ($contentId !== "") $customData["content_ids"] = [mb_substr($contentId, 0, 100)];

// Respond immediately — this is best-effort telemetry, never worth making
// the visitor's browser wait on.
capi_respond_then_continue(function () {
  echo json_encode(["success" => true]);
});

send_capi_event(
  $eventName,
  [],
  $customData,
  $eventId ?: null,
  ($sourceUrl !== "" && str_starts_with($sourceUrl, SITE_URL)) ? $sourceUrl : null
);
