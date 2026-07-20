<?php
/**
 * Admin blog post editor — create or edit a post (with cover photo upload).
 * Reuses the same session auth as admin.php.
 */
session_set_cookie_params([
  "httponly" => true,
  "samesite" => "Lax",
  "secure" => !empty($_SERVER["HTTPS"]),
]);
session_start();

require __DIR__ . "/admin-config.php";
define("APP_BOOTSTRAP", true);
require __DIR__ . "/db.php";
require __DIR__ . "/blog-lib.php";

if (empty($_SESSION["admin_authed"])) {
  header("Location: admin.php");
  exit;
}

function h(?string $s): string {
  return htmlspecialchars($s ?? "", ENT_QUOTES, "UTF-8");
}

$pdo = db_connect();
$id = (int)($_GET["id"] ?? $_POST["id"] ?? 0);
$existing = $id > 0 && $pdo ? (function () use ($pdo, $id) {
  $stmt = $pdo->prepare("SELECT * FROM posts WHERE id = :id");
  $stmt->execute([":id" => $id]);
  return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
})() : null;

$errors = [];
$values = $existing ?? [
  "title" => "", "slug" => "", "category" => BLOG_CATEGORIES[0], "excerpt" => "",
  "author_name" => "Speak in Urdu Team", "body" => "", "cover_image" => "", "published" => 1,
];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $values["title"] = trim((string)($_POST["title"] ?? ""));
  $values["slug"] = slugify((string)($_POST["slug"] ?? "") ?: $values["title"]);
  $values["category"] = trim((string)($_POST["category"] ?? ""));
  $values["excerpt"] = trim((string)($_POST["excerpt"] ?? ""));
  $values["author_name"] = trim((string)($_POST["author_name"] ?? "")) ?: "Speak in Urdu Team";
  $values["body"] = trim((string)($_POST["body"] ?? ""));
  $values["published"] = isset($_POST["published"]) ? 1 : 0;

  if ($values["title"] === "") $errors[] = "Title is required.";
  if ($values["slug"] === "") $errors[] = "Slug is required.";
  if (!in_array($values["category"], BLOG_CATEGORIES, true)) $errors[] = "Choose a valid category.";
  if ($values["excerpt"] === "") $errors[] = "Excerpt is required.";
  if ($values["body"] === "") $errors[] = "Body is required.";

  if (empty($errors) && $pdo) {
    // Ensure the slug is unique (append -2, -3, ... on collision).
    $baseSlug = $values["slug"];
    $n = 2;
    while (true) {
      $stmt = $pdo->prepare("SELECT id FROM posts WHERE slug = :slug AND id != :id");
      $stmt->execute([":slug" => $values["slug"], ":id" => $id]);
      if (!$stmt->fetch()) break;
      $values["slug"] = $baseSlug . "-" . $n;
      $n++;
    }

    try {
      $coverImage = $existing["cover_image"] ?? null;
      $uploaded = handle_cover_upload($_FILES["cover"] ?? [], $values["slug"]);
      if ($uploaded) {
        // Remove the old uploaded file if we're replacing it.
        if ($coverImage && str_starts_with($coverImage, "/uploads/blog/")) {
          $old = __DIR__ . $coverImage;
          if (is_file($old)) unlink($old);
        }
        $coverImage = $uploaded;
      } elseif (!empty($_POST["remove_cover"])) {
        if ($coverImage && str_starts_with($coverImage, "/uploads/blog/")) {
          $old = __DIR__ . $coverImage;
          if (is_file($old)) unlink($old);
        }
        $coverImage = null;
      }

      if ($existing) {
        $stmt = $pdo->prepare(
          "UPDATE posts SET title=:title, slug=:slug, category=:category, excerpt=:excerpt,
           author_name=:author_name, body=:body, cover_image=:cover_image, published=:published,
           updated_at=NOW() WHERE id=:id"
        );
        $stmt->execute([
          ":title" => $values["title"], ":slug" => $values["slug"], ":category" => $values["category"],
          ":excerpt" => $values["excerpt"], ":author_name" => $values["author_name"], ":body" => $values["body"],
          ":cover_image" => $coverImage, ":published" => $values["published"], ":id" => $id,
        ]);
      } else {
        $stmt = $pdo->prepare(
          "INSERT INTO posts (title, slug, category, excerpt, author_name, body, cover_image, published)
           VALUES (:title, :slug, :category, :excerpt, :author_name, :body, :cover_image, :published)"
        );
        $stmt->execute([
          ":title" => $values["title"], ":slug" => $values["slug"], ":category" => $values["category"],
          ":excerpt" => $values["excerpt"], ":author_name" => $values["author_name"], ":body" => $values["body"],
          ":cover_image" => $coverImage, ":published" => $values["published"],
        ]);
      }
      header("Location: admin.php?tab=posts");
      exit;
    } catch (RuntimeException $e) {
      $errors[] = $e->getMessage();
    } catch (Throwable $e) {
      error_log("Post save failed: " . $e->getMessage());
      $errors[] = "Something went wrong saving the post. Please try again.";
    }
  } elseif (!$pdo) {
    $errors[] = "Database unavailable right now — please try again shortly.";
  }
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title><?= $existing ? "Edit Post" : "New Post" ?> — Speak in Urdu Admin</title>
<style>
  :root{
    --paper:#EEF3EA; --card:#FFFFFF; --emerald:#3F562E; --emerald-mid:#52713D;
    --gold-soft:#C9A45A; --ink:#2F2F2F; --muted:#6B5F52; --border:#DCE6D6;
  }
  *{box-sizing:border-box;}
  body{margin:0; background:var(--paper); color:var(--ink); font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; font-size:15px;}
  .wrap{max-width:800px; margin:0 auto; padding:24px 24px 60px;}
  header.top{display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; gap:12px;}
  header.top h1{font-size:20px; margin:0;}
  header.top a{color:var(--muted); font-size:13.5px; text-decoration:none;}
  header.top a:hover{color:var(--ink);}
  .card{background:var(--card); border:1px solid var(--border); border-radius:14px; padding:26px;}
  .field{margin-bottom:18px;}
  .field label{display:block; font-weight:600; font-size:13.5px; margin-bottom:6px;}
  .field .hint{font-size:12.5px; color:var(--muted); margin-top:5px;}
  .field input[type=text],.field input[type=file],.field select,.field textarea{
    width:100%; font:inherit; font-size:14.5px; padding:10px 12px; border:1px solid var(--border); border-radius:9px; background:var(--paper); color:var(--ink);
  }
  .field textarea{resize:vertical;}
  .row2{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
  .checkrow{display:flex; align-items:center; gap:8px;}
  .checkrow input{width:auto;}
  .current-cover{display:flex; align-items:center; gap:12px; margin-bottom:10px;}
  .current-cover img{width:120px; height:80px; object-fit:cover; border-radius:8px; border:1px solid var(--border);}
  .errors{background:#fbe4e0; color:#8a2f22; border-radius:10px; padding:14px 16px; margin-bottom:18px; font-size:13.5px;}
  .errors ul{margin:4px 0 0; padding-left:18px;}
  .help{background:var(--paper); border:1px solid var(--border); border-radius:10px; padding:14px 16px; margin-bottom:18px; font-size:13px; color:var(--muted);}
  .help summary{cursor:pointer; font-weight:600; color:var(--ink);}
  .help code{background:var(--card); padding:1px 5px; border-radius:4px; font-size:12.5px;}
  .actions{display:flex; gap:12px; margin-top:22px;}
  .btn{padding:11px 22px; border-radius:10px; border:0; font-weight:700; font-size:14.5px; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center;}
  .btn-primary{background:var(--emerald); color:#fff;}
  .btn-primary:hover{background:var(--emerald-mid);}
  .btn-ghost{background:var(--card); color:var(--ink); border:1px solid var(--border);}
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <h1><?= $existing ? "Edit Post" : "New Post" ?></h1>
    <a href="admin.php?tab=posts">← Back to Blog Posts</a>
  </header>

  <?php if (!empty($errors)): ?>
    <div class="errors">Please fix the following:<ul><?php foreach ($errors as $e): ?><li><?= h($e) ?></li><?php endforeach; ?></ul></div>
  <?php endif; ?>

  <div class="card">
    <form method="post" enctype="multipart/form-data">
      <?php if ($existing): ?><input type="hidden" name="id" value="<?= (int)$existing["id"] ?>" /><?php endif; ?>

      <div class="field">
        <label for="title">Title</label>
        <input type="text" id="title" name="title" value="<?= h($values["title"]) ?>" required />
      </div>

      <div class="field">
        <label for="slug">URL slug</label>
        <input type="text" id="slug" name="slug" value="<?= h($values["slug"]) ?>" placeholder="leave blank to generate from title" />
        <p class="hint">This becomes the page address: speakinurdu.com/blog/<strong id="slug-preview"><?= h($values["slug"] ?: "your-slug") ?></strong></p>
      </div>

      <div class="row2">
        <div class="field">
          <label for="category">Category</label>
          <select id="category" name="category">
            <?php foreach (BLOG_CATEGORIES as $c): ?>
              <option value="<?= h($c) ?>" <?= $values["category"] === $c ? "selected" : "" ?>><?= h($c) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="field">
          <label for="author_name">Author name</label>
          <input type="text" id="author_name" name="author_name" value="<?= h($values["author_name"]) ?>" />
        </div>
      </div>

      <div class="field">
        <label for="excerpt">Short excerpt (shown in blog lists and search results)</label>
        <textarea id="excerpt" name="excerpt" rows="2" required><?= h($values["excerpt"]) ?></textarea>
      </div>

      <div class="field">
        <label>Cover photo</label>
        <?php if (!empty($values["cover_image"])): ?>
          <div class="current-cover">
            <img src="<?= h($values["cover_image"]) ?>" alt="" />
            <label class="hint"><input type="checkbox" name="remove_cover" value="1" style="width:auto"/> Remove current photo</label>
          </div>
        <?php endif; ?>
        <input type="file" name="cover" accept="image/png,image/jpeg,image/webp" />
        <p class="hint">JPG, PNG, or WEBP, up to 5 MB. Leave empty to keep the current photo.</p>
      </div>

      <div class="field">
        <label for="body">Article body</label>
        <details class="help">
          <summary>Formatting help</summary>
          <p style="margin:10px 0 4px">Leave a blank line between paragraphs. A few special lines:</p>
          <ul>
            <li><code>## Heading text</code> — section heading</li>
            <li><code>- point one</code> (one per line) — bullet list</li>
            <li><code>TIP: helpful note</code> — highlighted tip box</li>
            <li><code>URDU: اردو | translit | meaning</code> — Urdu word/phrase example</li>
            <li><code>&gt; شعر کا مصرعہ | Poet Name</code> — Urdu verse quote</li>
          </ul>
        </details>
        <textarea id="body" name="body" rows="16" required><?= h($values["body"]) ?></textarea>
      </div>

      <div class="field checkrow">
        <input type="checkbox" id="published" name="published" <?= $values["published"] ? "checked" : "" ?> />
        <label for="published" style="margin:0">Published (visible on the live site)</label>
      </div>

      <div class="actions">
        <button type="submit" class="btn btn-primary"><?= $existing ? "Save changes" : "Publish post" ?></button>
        <a href="admin.php?tab=posts" class="btn btn-ghost">Cancel</a>
      </div>
    </form>
  </div>
</div>
<script>
  var titleEl = document.getElementById("title");
  var slugEl = document.getElementById("slug");
  var preview = document.getElementById("slug-preview");
  function slugify(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  titleEl.addEventListener("blur", function () {
    if (!slugEl.value.trim()) {
      slugEl.value = slugify(titleEl.value);
    }
  });
  slugEl.addEventListener("input", function () {
    preview.textContent = slugify(slugEl.value) || "your-slug";
  });
</script>
</body>
</html>
