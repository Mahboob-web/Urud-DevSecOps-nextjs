<?php
/**
 * Blog list page — /blog (and /blog?cat=Grammar for category filters).
 * Server-rendered straight from MySQL so new/edited posts are live and
 * fully indexable the instant the client saves them in the dashboard.
 */
define("APP_BOOTSTRAP", true);
require __DIR__ . "/db.php";
require __DIR__ . "/blog-lib.php";
require __DIR__ . "/blog-layout.php";

$cat = trim((string)($_GET["cat"] ?? "All"));
if ($cat !== "All" && !in_array($cat, BLOG_CATEGORIES, true)) $cat = "All";

$pdo = db_connect();
$posts = $pdo ? fetch_published_posts($pdo, $cat) : [];
$featured = $posts[0] ?? null;
$rest = $featured ? array_slice($posts, 1) : [];

$canonical = SITE_URL . "/blog" . ($cat !== "All" ? "?cat=" . urlencode($cat) : "");
$title = $cat === "All" ? "Urdu Learning Blog — Tips, Grammar & Poetry | " . SITE_NAME : "$cat Articles — " . SITE_NAME . " Blog";
$desc = "Practical guides for learning Urdu: alphabet, grammar, vocabulary, classical poetry, culture, and travel phrases — written by native teachers.";

render_head($title, $desc, $canonical);
render_header("blog");
?>
<main id="main-content" tabindex="-1">
  <section class="mu-pagehero">
    <?php render_pattern(); ?>
    <div class="mu-wrap">
      <div class="mu-crumb">
        <a href="/">Home</a><span class="sep" aria-hidden="true">/</span>
        <span class="cur" aria-current="page">Blog</span>
      </div>
      <span class="mu-eyebrow">The Academy blog</span>
      <h1 class="mu-h2" style="margin-top:14px">Read, learn, and fall for Urdu.</h1>
      <p class="mu-lead">Practical lessons, grammar made friendly, vocabulary, poetry, culture, and travel — written by our teachers.</p>
    </div>
  </section>

  <section class="mu-section" style="padding-top:56px">
    <div class="mu-wrap">
      <div class="mu-filterbar" role="group" aria-label="Filter posts by category">
        <?php foreach (array_merge(["All"], BLOG_CATEGORIES) as $c): ?>
          <a class="mu-filterchip <?= $cat === $c ? "on" : "" ?>" href="/blog<?= $c === "All" ? "" : "?cat=" . urlencode($c) ?>"><?= htmlspecialchars($c, ENT_QUOTES, "UTF-8") ?></a>
        <?php endforeach; ?>
      </div>

      <?php if (empty($posts)): ?>
        <p class="mu-resultcount">No posts in this category yet — check back soon.</p>
      <?php endif; ?>

      <?php if ($featured): ?>
        <a class="mu-feature" style="margin-top:28px" href="/blog/<?= htmlspecialchars($featured["slug"], ENT_QUOTES, "UTF-8") ?>" aria-label="Read: <?= htmlspecialchars($featured["title"], ENT_QUOTES, "UTF-8") ?>">
          <div class="mu-feature-body">
            <span class="mu-catpill"><?= htmlspecialchars($featured["category"], ENT_QUOTES, "UTF-8") ?></span>
            <h2><?= htmlspecialchars($featured["title"], ENT_QUOTES, "UTF-8") ?></h2>
            <p><?= htmlspecialchars($featured["excerpt"], ENT_QUOTES, "UTF-8") ?></p>
            <div class="mu-postmeta">
              <span><?= icon("calendar", 14) ?> <?= format_post_date($featured["created_at"]) ?></span>
              <span class="dot" aria-hidden="true">·</span>
              <span><?= icon("clock", 14) ?> <?= estimate_read_time($featured["body"]) ?></span>
            </div>
            <span class="mu-textlink" style="margin-top:6px">Read article <?= icon("arrow-right", 15) ?></span>
          </div>
          <div class="mu-feature-art" aria-hidden="true">
            <?php render_photo($featured["cover_image"] ?: null, "4 / 3", true); ?>
          </div>
        </a>
      <?php endif; ?>

      <?php if (!empty($rest)): ?>
        <div class="mu-grid cols3" style="margin-top:28px">
          <?php foreach ($rest as $p): ?>
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
      <?php endif; ?>
    </div>
  </section>
  <?php render_final_cta(); ?>
</main>
<?php
render_footer();
