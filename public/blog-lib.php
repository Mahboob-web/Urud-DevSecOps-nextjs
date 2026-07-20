<?php
/**
 * Shared helpers for the PHP-rendered blog (public pages + admin editor).
 * Blog posts live in MySQL (see schema.sql `posts` table) and render as
 * real server-rendered HTML on every request — so a post the client
 * publishes today is fully indexable immediately, no site rebuild needed.
 */

const BLOG_CATEGORIES = ["Learn Urdu", "Grammar", "Vocabulary", "Urdu Poetry", "Culture", "Travel", "Kids"];
const SITE_URL = "https://speakinurdu.com";
const SITE_NAME = "Speak in Urdu";

/**
 * Cache-busting query string for a static asset in public/ — same idea as
 * Vite's hashed JS filenames, using the file's last-modified time instead
 * of a content hash (cheaper, and just as effective: the URL only needs to
 * change when the file does). Lets .htaccess cache these for a full year
 * without ever risking a stale copy after a deploy.
 */
function asset_version(string $publicRelativePath): string {
  $mtime = @filemtime(__DIR__ . "/" . ltrim($publicRelativePath, "/"));
  return $mtime !== false ? (string)$mtime : "1";
}

function slugify(string $text): string {
  $text = strtolower(trim($text));
  $text = preg_replace('/[^a-z0-9]+/', '-', $text);
  return trim($text, '-');
}

function format_post_date(string $datetime): string {
  $ts = strtotime($datetime);
  return $ts ? date("M j, Y", $ts) : $datetime;
}

function estimate_read_time(string $body): string {
  $words = str_word_count(strip_tags($body));
  $minutes = max(1, (int)ceil($words / 200));
  return "$minutes min";
}

function initials_for(string $name): string {
  preg_match_all('/\b\p{L}/u', $name, $m);
  $letters = array_slice($m[0], 0, 2);
  return strtoupper(implode('', $letters)) ?: "SU";
}

/**
 * Tiny markdown-lite -> HTML converter for post bodies, written for a
 * non-technical author (see the "Formatting help" box in the admin editor).
 * Recognizes:
 *   ## Heading            -> <h2>
 *   - list item           -> <ul><li>
 *   TIP: text              -> callout box
 *   URDU: ur | translit | meaning -> Urdu example block
 *   > verse text | Author  -> Urdu verse blockquote
 *   (blank-line separated) -> <p>
 */
function render_post_body(string $raw): string {
  $raw = str_replace("\r\n", "\n", trim($raw));
  $blocks = preg_split('/\n\s*\n/', $raw);
  $html = '<div class="mu-article">';
  $listBuffer = [];

  $flushList = function () use (&$listBuffer, &$html) {
    if (empty($listBuffer)) return;
    $html .= "<ul>";
    foreach ($listBuffer as $item) {
      $html .= "<li>" . htmlspecialchars($item, ENT_QUOTES, "UTF-8") . "</li>";
    }
    $html .= "</ul>";
    $listBuffer = [];
  };

  foreach ($blocks as $block) {
    $block = trim($block);
    if ($block === "") continue;
    $lines = explode("\n", $block);

    // A block made entirely of "- " lines is a list.
    $isList = true;
    foreach ($lines as $line) {
      if (!str_starts_with(trim($line), "- ")) { $isList = false; break; }
    }
    if ($isList) {
      foreach ($lines as $line) $listBuffer[] = trim(substr(trim($line), 2));
      $flushList();
      continue;
    }
    $flushList();

    if (str_starts_with($block, "## ")) {
      $html .= "<h2>" . htmlspecialchars(trim(substr($block, 3)), ENT_QUOTES, "UTF-8") . "</h2>";
      continue;
    }
    if (str_starts_with($block, "TIP:")) {
      $text = trim(substr($block, 4));
      $html .= '<aside class="mu-callout"><span class="ic">'
        . '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>'
        . '</span><p>' . htmlspecialchars($text, ENT_QUOTES, "UTF-8") . '</p></aside>';
      continue;
    }
    if (str_starts_with($block, "URDU:")) {
      $parts = array_map('trim', explode("|", substr($block, 5)));
      [$ur, $tr, $en] = [$parts[0] ?? "", $parts[1] ?? "", $parts[2] ?? ""];
      $html .= '<div class="mu-urduex">'
        . '<span class="ur mu-urdu" lang="ur" dir="rtl">' . htmlspecialchars($ur, ENT_QUOTES, "UTF-8") . '</span>'
        . '<span class="tr">' . htmlspecialchars($tr, ENT_QUOTES, "UTF-8") . '</span>'
        . '<span class="en">' . htmlspecialchars($en, ENT_QUOTES, "UTF-8") . '</span>'
        . '</div>';
      continue;
    }
    if (str_starts_with($block, ">")) {
      $line = trim(substr($block, 1));
      $parts = explode("|", $line, 2);
      $verse = trim($parts[0]);
      $by = isset($parts[1]) ? trim($parts[1]) : "";
      $html .= '<blockquote class="mu-verse"><span class="mu-urdu" lang="ur" dir="rtl">' . htmlspecialchars($verse, ENT_QUOTES, "UTF-8") . '</span>';
      if ($by !== "") $html .= '<cite>— ' . htmlspecialchars($by, ENT_QUOTES, "UTF-8") . '</cite>';
      $html .= '</blockquote>';
      continue;
    }
    // Plain paragraph — preserve single line breaks within it.
    $escaped = htmlspecialchars($block, ENT_QUOTES, "UTF-8");
    $html .= "<p>" . nl2br($escaped) . "</p>";
  }
  $flushList();
  $html .= "</div>";
  return $html;
}

/**
 * Validates and saves an uploaded cover photo to public/uploads/blog/.
 * Returns the public URL path (e.g. "/uploads/blog/my-post-172...jpg") on
 * success, null if no file was submitted, or throws with a user-facing
 * message on validation failure.
 */
function handle_cover_upload(array $file, string $slug): ?string {
  if (empty($file["name"]) || $file["error"] === UPLOAD_ERR_NO_FILE) return null;
  if ($file["error"] !== UPLOAD_ERR_OK) throw new RuntimeException("The photo upload failed. Please try again.");

  $maxBytes = 5 * 1024 * 1024;
  if ($file["size"] > $maxBytes) throw new RuntimeException("Photo is too large — please use one under 5 MB.");

  $allowed = ["image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp"];
  $mime = mime_content_type($file["tmp_name"]);
  if (!isset($allowed[$mime])) throw new RuntimeException("Photo must be a JPG, PNG, or WEBP file.");

  $dir = __DIR__ . "/uploads/blog";
  if (!is_dir($dir)) mkdir($dir, 0755, true);

  $filename = $slug . "-" . time() . "." . $allowed[$mime];
  $dest = $dir . "/" . $filename;
  if (!move_uploaded_file($file["tmp_name"], $dest)) {
    throw new RuntimeException("Could not save the uploaded photo. Please try again.");
  }
  return "/uploads/blog/" . $filename;
}

// Every fetch_* helper here swallows DB errors and returns an empty
// result — most commonly this means the `posts` table hasn't been created
// yet (see schema.sql). Blog pages should degrade to "no posts yet"
// rather than a fatal error for a visitor.

function fetch_published_posts(PDO $pdo, ?string $category = null): array {
  try {
    $sql = "SELECT * FROM posts WHERE published = 1";
    $params = [];
    if ($category && $category !== "All") {
      $sql .= " AND category = :cat";
      $params[":cat"] = $category;
    }
    $sql .= " ORDER BY created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  } catch (Throwable $e) {
    error_log("fetch_published_posts failed: " . $e->getMessage());
    return [];
  }
}

function fetch_post_by_slug(PDO $pdo, string $slug, bool $publishedOnly = true): ?array {
  try {
    $sql = "SELECT * FROM posts WHERE slug = :slug" . ($publishedOnly ? " AND published = 1" : "");
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":slug" => $slug]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  } catch (Throwable $e) {
    error_log("fetch_post_by_slug failed: " . $e->getMessage());
    return null;
  }
}
