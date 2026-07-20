<?php
/**
 * Dynamic sitemap — /sitemap.xml (rewritten here by .htaccess).
 *
 * The static pages (home, courses, pricing, etc.) rarely change so they're
 * listed directly below. Blog posts are queried fresh from the database on
 * every request, so a post the client publishes today shows up in the
 * sitemap immediately — no site rebuild needed, unlike the rest of the app.
 */
define("APP_BOOTSTRAP", true);
require __DIR__ . "/db.php";
require __DIR__ . "/blog-lib.php";

header("Content-Type: application/xml; charset=UTF-8");

$staticPaths = [
  ["path" => "/", "priority" => "1.0"],
  ["path" => "/courses", "priority" => "0.9"],
  ["path" => "/pricing", "priority" => "0.9"],
  ["path" => "/payment", "priority" => "0.9"],
  ["path" => "/about", "priority" => "0.9"],
  ["path" => "/blog", "priority" => "0.9"],
  ["path" => "/contact", "priority" => "0.9"],
  ["path" => "/courses/kids-1-1", "priority" => "0.7"],
  ["path" => "/courses/women-1-1", "priority" => "0.7"],
  ["path" => "/courses/gcse-urdu-exam-prep", "priority" => "0.7"],
  ["path" => "/courses/read-write-urdu", "priority" => "0.7"],
  ["path" => "/courses/summer-urdu-course", "priority" => "0.7"],
  ["path" => "/courses/back-to-school-urdu", "priority" => "0.7"],
];

$pdo = db_connect();
$posts = $pdo ? fetch_published_posts($pdo) : [];

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

foreach ($staticPaths as $p) {
  echo "  <url>\n    <loc>" . SITE_URL . $p["path"] . "</loc>\n    <priority>{$p["priority"]}</priority>\n  </url>\n";
}
foreach ($posts as $post) {
  $lastmod = date("Y-m-d", strtotime($post["updated_at"] ?? $post["created_at"]));
  echo "  <url>\n    <loc>" . SITE_URL . "/blog/" . htmlspecialchars($post["slug"], ENT_QUOTES, "UTF-8") . "</loc>\n    <lastmod>$lastmod</lastmod>\n    <priority>0.7</priority>\n  </url>\n";
}

echo '</urlset>' . "\n";
