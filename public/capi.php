<?php
/**
 * Meta Conversions API — server-to-server event tracking.
 *
 * Sends the same events as the browser-side Meta Pixel, but directly from
 * this server to Meta's Graph API, so an ad blocker or browser tracking
 * protection on the visitor's side can't silently drop the event (the
 * problem that led to adding this in the first place — see conversation
 * history if you're wondering why both exist).
 *
 * Pass the same `event_id` to both the browser pixel call (fbq('track',
 * name, data, {eventID: id})) and send_capi_event() for the same real
 * action, so Meta deduplicates them into a single event instead of
 * double-counting.
 */

$__capiConfigPath = __DIR__ . "/capi-config.php";
if (is_file($__capiConfigPath)) {
  require_once $__capiConfigPath;
}

function capi_configured(): bool {
  return defined("CAPI_ACCESS_TOKEN") && CAPI_ACCESS_TOKEN !== "" && defined("PIXEL_ID");
}

function capi_client_ip(): string {
  // Hostinger shared hosting has no proxy in front by default, but fall
  // back to X-Forwarded-For if one's ever added (e.g. a CDN).
  $forwarded = $_SERVER["HTTP_X_FORWARDED_FOR"] ?? "";
  if ($forwarded !== "") {
    return trim(explode(",", $forwarded)[0]);
  }
  return $_SERVER["REMOTE_ADDR"] ?? "";
}

/**
 * Sends one event to Meta's Conversions API. Best-effort and silent —
 * never throws, never blocks the caller for more than ~2 seconds, and
 * simply does nothing if capi-config.php hasn't been set up yet.
 *
 * @param string $eventName    Standard Meta event name: Lead, Contact,
 *                              Subscribe, ViewContent, InitiateCheckout,
 *                              PageView, etc.
 * @param array  $userData     Optional plain (unhashed) PII to match —
 *                              this function hashes it before sending.
 *                              Recognized keys: email, phone, first_name.
 * @param array  $customData   Optional event-specific data, e.g.
 *                              ["content_name" => "...", "content_ids" => [...]].
 * @param ?string $eventId     Shared ID with the matching browser pixel
 *                              event, for deduplication. Strongly
 *                              recommended when a browser event also fires.
 * @param ?string $sourceUrl   The page URL the event happened on. Defaults
 *                              to the current request's URL.
 */
function send_capi_event(
  string $eventName,
  array $userData = [],
  array $customData = [],
  ?string $eventId = null,
  ?string $sourceUrl = null
): void {
  if (!capi_configured()) return;

  $event = [
    "event_name" => $eventName,
    "event_time" => time(),
    "action_source" => "website",
    "event_source_url" => $sourceUrl ?? ("https://" . ($_SERVER["HTTP_HOST"] ?? "speakinurdu.com") . ($_SERVER["REQUEST_URI"] ?? "/")),
  ];
  if ($eventId) {
    $event["event_id"] = $eventId;
  }

  $ud = [
    "client_ip_address" => capi_client_ip(),
    "client_user_agent" => $_SERVER["HTTP_USER_AGENT"] ?? "",
  ];
  // _fbp/_fbc cookies are set by the browser pixel itself — including them
  // here (when present) significantly improves Meta's match quality.
  if (!empty($_COOKIE["_fbp"])) $ud["fbp"] = $_COOKIE["_fbp"];
  if (!empty($_COOKIE["_fbc"])) $ud["fbc"] = $_COOKIE["_fbc"];

  if (!empty($userData["email"])) {
    $ud["em"] = hash("sha256", strtolower(trim($userData["email"])));
  }
  if (!empty($userData["phone"])) {
    $ud["ph"] = hash("sha256", preg_replace('/\D+/', '', $userData["phone"]));
  }
  if (!empty($userData["first_name"])) {
    $parts = preg_split('/\s+/', trim($userData["first_name"]), 2);
    $ud["fn"] = hash("sha256", strtolower($parts[0]));
    if (!empty($parts[1])) {
      $ud["ln"] = hash("sha256", strtolower($parts[1]));
    }
  }
  $event["user_data"] = $ud;

  if (!empty($customData)) {
    $event["custom_data"] = $customData;
  }

  $payload = json_encode(["data" => [$event]]);
  $url = "https://graph.facebook.com/v21.0/" . PIXEL_ID . "/events?access_token=" . urlencode(CAPI_ACCESS_TOKEN);

  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 2,
    CURLOPT_CONNECTTIMEOUT => 2,
  ]);
  $response = curl_exec($ch);
  if (curl_errno($ch)) {
    error_log("Meta CAPI request failed ($eventName): " . curl_error($ch));
  } elseif (curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 400) {
    error_log("Meta CAPI error response ($eventName): " . $response);
  }
  curl_close($ch);
}

/**
 * Finishes the HTTP response to the browser immediately, then lets
 * execution continue in the background — so sending the CAPI event
 * doesn't add latency to the form submission the visitor is waiting on.
 * Falls back to just continuing normally if the server doesn't support it
 * (still works, just adds up to ~2s in the worst case instead of 0).
 */
function capi_respond_then_continue(callable $sendResponse): void {
  $sendResponse();
  if (function_exists("fastcgi_finish_request")) {
    fastcgi_finish_request();
  }
}
