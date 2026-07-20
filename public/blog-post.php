<?php
/**
 * Blog post detail page — /blog/<slug>.
 * Server-rendered from MySQL, same as blog.php.
 */
define("APP_BOOTSTRAP", true);
require __DIR__ . "/db.php";
require __DIR__ . "/blog-lib.php";
require __DIR__ . "/blog-layout.php";
require __DIR__ . "/capi.php";

$slug = trim((string)($_GET["slug"] ?? ""));
$pdo = db_connect();
$post = $pdo && $slug !== "" ? fetch_post_by_slug($pdo, $slug) : null;

if (!$post) {
  http_response_code(404);
  render_head("Article not found | " . SITE_NAME, "This article may have moved. Browse all articles on the Speak in Urdu blog.", SITE_URL . "/blog");
  render_header("blog");
  ?>
  <main id="main-content" tabindex="-1">
    <section class="mu-section" style="min-height:46vh; display:grid; place-items:center; text-align:center">
      <div class="mu-wrap">
        <span class="mu-eyebrow" style="justify-content:center">Not found</span>
        <h1 class="mu-h2" style="margin-top:14px">We couldn't find that article.</h1>
        <p class="mu-lead" style="margin:14px auto 24px">It may have moved. Browse all articles instead.</p>
        <a class="mu-btn mu-btn-lg mu-btn-primary" href="/blog">Back to blog</a>
      </div>
    </section>
  </main>
  <?php
  render_footer();
  exit;
}

$related = [];
if ($pdo) {
  try {
    $stmt = $pdo->prepare("SELECT * FROM posts WHERE published = 1 AND category = :cat AND slug != :slug ORDER BY created_at DESC LIMIT 3");
    $stmt->execute([":cat" => $post["category"], ":slug" => $post["slug"]]);
    $related = $stmt->fetchAll(PDO::FETCH_ASSOC);
  } catch (Throwable $e) {
    error_log("related posts query failed: " . $e->getMessage());
  }
}

$canonical = SITE_URL . "/blog/" . $post["slug"];
$title = htmlspecialchars_decode($post["title"]) . " | " . SITE_NAME;
$jsonLd = [[
  "@type" => "BlogPosting",
  "headline" => $post["title"],
  "description" => $post["excerpt"],
  "datePublished" => date("c", strtotime($post["created_at"])),
  "author" => ["@type" => "Person", "name" => $post["author_name"]],
  "articleSection" => $post["category"],
  "publisher" => ["@type" => "Organization", "name" => SITE_NAME],
]];

render_head($title, $post["excerpt"], $canonical, $post["cover_image"] ?: null, true, $jsonLd);

// One event_id shared between the browser pixel call below and the
// server-side CAPI call, so Meta dedupes them into a single ViewContent.
$viewEventId = bin2hex(random_bytes(8));
?>
<script>
  if (typeof fbq === "function") {
    fbq('track', 'ViewContent', {
      content_name: <?= json_encode($post["title"]) ?>,
      content_category: 'blog_post',
      content_ids: [<?= json_encode($post["slug"]) ?>]
    }, { eventID: <?= json_encode($viewEventId) ?> });
  }
</script>
<?php
send_capi_event(
  "ViewContent",
  [],
  ["content_name" => $post["title"], "content_category" => "blog_post", "content_ids" => [$post["slug"]]],
  $viewEventId,
  $canonical
);
render_header("post");
?>
<main id="main-content" tabindex="-1">
  <section class="mu-pagehero mu-posthero">
    <?php render_pattern(); ?>
    <div class="mu-wrap mu-narrow">
      <div class="mu-crumb">
        <a href="/">Home</a><span class="sep" aria-hidden="true">/</span>
        <a href="/blog">Blog</a><span class="sep" aria-hidden="true">/</span>
        <span class="cur" aria-current="page"><?= htmlspecialchars($post["category"], ENT_QUOTES, "UTF-8") ?></span>
      </div>
      <span class="mu-catpill"><?= htmlspecialchars($post["category"], ENT_QUOTES, "UTF-8") ?></span>
      <h1 class="mu-h2" style="margin-top:14px; font-size:clamp(28px,4.6vw,44px)"><?= htmlspecialchars($post["title"], ENT_QUOTES, "UTF-8") ?></h1>
      <div style="margin-top:18px" class="mu-postmeta">
        <span><?= icon("calendar", 14) ?> <?= format_post_date($post["created_at"]) ?></span>
        <span class="dot" aria-hidden="true">·</span>
        <span><?= icon("clock", 14) ?> <?= estimate_read_time($post["body"]) ?></span>
        <span class="dot" aria-hidden="true">·</span>
        <span><?= htmlspecialchars($post["author_name"], ENT_QUOTES, "UTF-8") ?></span>
      </div>
    </div>
  </section>

  <article class="mu-section" style="padding-top:8px">
    <div class="mu-wrap mu-narrow">
      <?php render_photo($post["cover_image"] ?: null, "21 / 9", true); ?>
      <p class="mu-article-lead"><?= htmlspecialchars($post["excerpt"], ENT_QUOTES, "UTF-8") ?></p>
      <?= render_post_body($post["body"]) ?>

      <div class="mu-post-cta">
        <div>
          <h3>Want to actually speak this?</h3>
          <p>Book a free trial and learn live with a native teacher.</p>
        </div>
        <a class="mu-btn mu-btn-lg mu-btn-primary" href="/?trial=1">Book a Free Trial <?= icon("arrow-right") ?></a>
      </div>

      <a class="mu-textlink" style="margin-top:28px" href="/blog"><?= icon("arrow-left", 16) ?> Back to all articles</a>
    </div>
  </article>

  <?php if (!empty($related)): ?>
    <section class="mu-section" style="background:var(--card); border-top:1px solid var(--border); padding-top:64px" aria-labelledby="related-h">
      <div class="mu-wrap">
        <h2 class="mu-h2" id="related-h" style="font-size:clamp(22px,3vw,30px)">More in <?= htmlspecialchars($post["category"], ENT_QUOTES, "UTF-8") ?></h2>
        <div class="mu-grid cols3" style="margin-top:28px">
          <?php foreach ($related as $p): ?>
            <a class="mu-card mu-postcard" href="/blog/<?= htmlspecialchars($p["slug"], ENT_QUOTES, "UTF-8") ?>" aria-label="Read: <?= htmlspecialchars($p["title"], ENT_QUOTES, "UTF-8") ?>">
              <?php render_photo($p["cover_image"] ?: null, "16 / 9", true); ?>
              <div class="mu-postcard-body">
                <span class="mu-catpill sm"><?= htmlspecialchars($p["category"], ENT_QUOTES, "UTF-8") ?></span>
                <h3><?= htmlspecialchars($p["title"], ENT_QUOTES, "UTF-8") ?></h3>
                <p><?= htmlspecialchars($p["excerpt"], ENT_QUOTES, "UTF-8") ?></p>
                <div class="mu-postmeta">
                  <span><?= icon("calendar", 14) ?> <?= format_post_date($p["created_at"]) ?></span>
                  <span class="dot" aria-hidden="true">·</span>
                  <span><?= icon("clock", 14) ?> <?= estimate_read_time($p["body"]) ?></span>
                </div>
                <span class="mu-textlink">Read article <?= icon("arrow-right", 15) ?></span>
              </div>
            </a>
          <?php endforeach; ?>
        </div>
      </div>
    </section>
  <?php endif; ?>
</main>
<?php
render_footer();
