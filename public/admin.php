<?php
/**
 * Admin dashboard — view bookings, contact messages, and newsletter signups.
 *
 * Single shared password (see admin-config.php), session-based login.
 * No client-side framework — plain PHP, works anywhere PHP works.
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

// ---- login / logout ----

if (isset($_GET["logout"])) {
  $_SESSION = [];
  session_destroy();
  header("Location: admin.php");
  exit;
}

if (isset($_POST["password"])) {
  if (hash_equals(ADMIN_PASSWORD, (string)$_POST["password"])) {
    $_SESSION["admin_authed"] = true;
    header("Location: admin.php");
    exit;
  }
  $loginError = "Wrong password.";
}

$authed = !empty($_SESSION["admin_authed"]);

// ---- data (only once logged in) ----

const TABS = [
  "bookings" => ["label" => "Bookings", "cols" => ["created_at", "name", "email", "phone", "age", "gender", "country", "timezone", "class_time", "course"], "search" => ["name", "email", "phone", "course"]],
  "contacts" => ["label" => "Contact Messages", "cols" => ["created_at", "name", "email", "phone", "timezone", "message"], "search" => ["name", "email", "phone", "message"]],
  "newsletter" => ["label" => "Newsletter", "cols" => ["created_at", "email"], "search" => ["email"]],
  "posts" => ["label" => "Blog Posts"],
];
const TABLE_NAMES = ["bookings" => "bookings", "contacts" => "contacts", "newsletter" => "newsletter_signups"];

$tab = $_GET["tab"] ?? "bookings";
if (!isset(TABS[$tab])) {
  $tab = "bookings";
}
$q = trim((string)($_GET["q"] ?? ""));

// ---- blog post actions (publish toggle / delete) ----

if ($authed && $tab === "posts" && $_SERVER["REQUEST_METHOD"] === "POST") {
  $pdo = db_connect();
  $postId = (int)($_POST["id"] ?? 0);
  if ($pdo && $postId > 0) {
    if (($_POST["action"] ?? "") === "toggle_publish") {
      $stmt = $pdo->prepare("UPDATE posts SET published = 1 - published WHERE id = :id");
      $stmt->execute([":id" => $postId]);
    } elseif (($_POST["action"] ?? "") === "delete") {
      $stmt = $pdo->prepare("SELECT cover_image FROM posts WHERE id = :id");
      $stmt->execute([":id" => $postId]);
      $row = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($row && !empty($row["cover_image"]) && str_starts_with($row["cover_image"], "/uploads/blog/")) {
        $path = __DIR__ . $row["cover_image"];
        if (is_file($path)) unlink($path);
      }
      $stmt = $pdo->prepare("DELETE FROM posts WHERE id = :id");
      $stmt->execute([":id" => $postId]);
    }
  }
  header("Location: admin.php?tab=posts");
  exit;
}

function fetch_all_posts(?PDO $pdo, string $q): array {
  if (!$pdo) return [];
  try {
    $sql = "SELECT * FROM posts";
    $params = [];
    if ($q !== "") {
      $sql .= " WHERE title LIKE :q OR slug LIKE :q OR category LIKE :q";
      $params[":q"] = "%$q%";
    }
    $sql .= " ORDER BY created_at DESC LIMIT 500";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  } catch (Throwable $e) {
    error_log("fetch_all_posts failed: " . $e->getMessage());
    return [];
  }
}

function fetch_rows(?PDO $pdo, string $tab, string $q): array {
  if (!$pdo) return [];
  $table = TABLE_NAMES[$tab];
  $searchCols = TABS[$tab]["search"];
  $sql = "SELECT * FROM `$table`";
  $params = [];
  if ($q !== "") {
    $clauses = array_map(fn($c) => "`$c` LIKE :q", $searchCols);
    $sql .= " WHERE " . implode(" OR ", $clauses);
    $params[":q"] = "%$q%";
  }
  $sql .= " ORDER BY created_at DESC LIMIT 500";
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// ---- CSV export (before any HTML output) ----

if ($authed && $tab !== "posts" && isset($_GET["export"])) {
  $pdo = db_connect();
  $rows = fetch_rows($pdo, $tab, $q);
  header("Content-Type: text/csv; charset=UTF-8");
  header("Content-Disposition: attachment; filename=\"{$tab}.csv\"");
  $out = fopen("php://output", "w");
  if (!empty($rows)) {
    fputcsv($out, array_keys($rows[0]));
    foreach ($rows as $row) {
      fputcsv($out, $row);
    }
  }
  fclose($out);
  exit;
}

$rows = $authed && $tab !== "posts" ? fetch_rows(db_connect(), $tab, $q) : [];
$posts = $authed && $tab === "posts" ? fetch_all_posts(db_connect(), $q) : [];

function h(?string $s): string {
  return htmlspecialchars($s ?? "", ENT_QUOTES, "UTF-8");
}

function label_for(string $col): string {
  $map = [
    "created_at" => "Date", "name" => "Name", "email" => "Email", "phone" => "Phone", "age" => "Age",
    "gender" => "Gender", "country" => "Country", "timezone" => "Timezone",
    "class_time" => "Preferred Time", "course" => "Course", "message" => "Message",
  ];
  return $map[$col] ?? ucfirst($col);
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Admin — Speak in Urdu</title>
<style>
  :root{
    --paper:#EEF3EA; --card:#FFFFFF; --emerald:#3F562E; --emerald-mid:#52713D;
    --gold-soft:#C9A45A; --ink:#2F2F2F; --muted:#6B5F52; --border:#DCE6D6;
  }
  *{box-sizing:border-box;}
  body{margin:0; background:var(--paper); color:var(--ink); font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; font-size:15px;}
  .wrap{max-width:1180px; margin:0 auto; padding:24px;}

  .login-wrap{min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;}
  .login-card{background:var(--card); border:1px solid var(--border); border-radius:16px; padding:32px; width:100%; max-width:360px; box-shadow:0 8px 30px -12px rgba(47,47,47,.2);}
  .login-card h1{font-size:19px; margin:0 0 6px;}
  .login-card p{color:var(--muted); font-size:13.5px; margin:0 0 20px;}
  .login-card input[type=password]{width:100%; padding:11px 13px; border:1px solid var(--border); border-radius:10px; font-size:15px; margin-bottom:12px;}
  .login-card button{width:100%; padding:11px; border:0; border-radius:10px; background:var(--emerald); color:#fff; font-weight:600; font-size:14.5px; cursor:pointer;}
  .login-card button:hover{background:var(--emerald-mid);}
  .login-err{color:#b23a2e; font-size:13px; margin-bottom:12px;}

  header.top{display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; flex-wrap:wrap; gap:12px;}
  header.top h1{font-size:20px; margin:0;}
  header.top a.logout{color:var(--muted); font-size:13.5px; text-decoration:none;}
  header.top a.logout:hover{color:var(--ink);}

  .tabs{display:flex; gap:6px; margin-bottom:18px; flex-wrap:wrap;}
  .tabs a{padding:8px 16px; border-radius:999px; text-decoration:none; font-size:13.5px; font-weight:600; color:var(--muted); background:var(--card); border:1px solid var(--border);}
  .tabs a.on{background:var(--emerald); color:#fff; border-color:var(--emerald);}

  .toolbar{display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; align-items:center;}
  .toolbar input[type=text]{flex:1; min-width:200px; padding:9px 12px; border:1px solid var(--border); border-radius:9px; font-size:14px;}
  .toolbar button{padding:9px 16px; border:1px solid var(--border); background:var(--card); border-radius:9px; cursor:pointer; font-size:13.5px; font-weight:600;}
  .toolbar a.export{padding:9px 16px; border-radius:9px; background:var(--gold-soft); color:var(--ink); text-decoration:none; font-size:13.5px; font-weight:700; white-space:nowrap;}

  .table-wrap{background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:auto;}
  table{width:100%; border-collapse:collapse; min-width:640px;}
  th,td{padding:11px 14px; text-align:left; font-size:13.5px; border-bottom:1px solid var(--border); white-space:nowrap;}
  td.wrap-cell{white-space:normal; max-width:280px;}
  th{background:var(--paper); font-weight:700; font-size:11.5px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); position:sticky; top:0;}
  tr:last-child td{border-bottom:0;}
  .empty{padding:40px; text-align:center; color:var(--muted);}
  .count{color:var(--muted); font-size:13px; margin-bottom:12px;}

  .thumb{width:52px; height:36px; object-fit:cover; border-radius:6px; display:block; background:var(--paper);}
  .thumb-empty{background:linear-gradient(135deg,var(--emerald),var(--emerald-mid));}
  .muted{color:var(--muted); font-size:12px;}
  .pill{display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:700;}
  .pill-live{background:#dcecd8; color:#2c5a2a;}
  .pill-draft{background:#efe6d3; color:#8a6a1f;}
  .actions{display:flex; gap:10px; align-items:center; white-space:nowrap;}
  .actions a{color:var(--emerald); font-weight:600; text-decoration:none; font-size:13px;}
  .actions a:hover{text-decoration:underline;}
  .actions form{display:inline;}
  .linklike{background:none; border:0; padding:0; color:var(--emerald); font-weight:600; font-size:13px; cursor:pointer; font-family:inherit;}
  .linklike:hover{text-decoration:underline;}
  .linklike.danger{color:#b23a2e;}
</style>
</head>
<body>

<?php if (!$authed): ?>
  <div class="login-wrap">
    <div class="login-card">
      <h1>Admin login</h1>
      <p>Speak in Urdu — bookings &amp; messages</p>
      <?php if (!empty($loginError)): ?><div class="login-err"><?= h($loginError) ?></div><?php endif; ?>
      <form method="post">
        <input type="password" name="password" placeholder="Password" autofocus required />
        <button type="submit">Log in</button>
      </form>
    </div>
  </div>
<?php else: ?>
  <div class="wrap">
    <header class="top">
      <h1>Speak in Urdu — Admin</h1>
      <a class="logout" href="?logout=1">Log out</a>
    </header>

    <nav class="tabs">
      <?php foreach (TABS as $key => $info): ?>
        <a class="<?= $tab === $key ? "on" : "" ?>" href="?tab=<?= h($key) ?>"><?= h($info["label"]) ?></a>
      <?php endforeach; ?>
    </nav>

    <form class="toolbar" method="get">
      <input type="hidden" name="tab" value="<?= h($tab) ?>" />
      <input type="text" name="q" value="<?= h($q) ?>" placeholder="<?= $tab === "posts" ? "Search title or category…" : "Search name or email…" ?>" />
      <button type="submit">Search</button>
      <?php if ($tab === "posts"): ?>
        <a class="export" href="admin-post-edit.php">+ New Post</a>
      <?php else: ?>
        <a class="export" href="?tab=<?= h($tab) ?>&q=<?= urlencode($q) ?>&export=csv">Export CSV</a>
      <?php endif; ?>
    </form>

    <?php if ($tab === "posts"): ?>
      <p class="count"><?= count($posts) ?> post<?= count($posts) === 1 ? "" : "s" ?><?= $q !== "" ? " for \"" . h($q) . "\"" : "" ?></p>
      <div class="table-wrap">
        <?php if (empty($posts)): ?>
          <div class="empty">No blog posts yet — click "+ New Post" to write the first one.</div>
        <?php else: ?>
          <table>
            <thead>
              <tr><th></th><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <?php foreach ($posts as $p): ?>
                <tr>
                  <td>
                    <?php if (!empty($p["cover_image"])): ?>
                      <img class="thumb" src="<?= h($p["cover_image"]) ?>" alt="" />
                    <?php else: ?>
                      <span class="thumb thumb-empty"></span>
                    <?php endif; ?>
                  </td>
                  <td class="wrap-cell"><strong><?= h($p["title"]) ?></strong><br /><span class="muted">/blog/<?= h($p["slug"]) ?></span></td>
                  <td><?= h($p["category"]) ?></td>
                  <td><span class="pill <?= $p["published"] ? "pill-live" : "pill-draft" ?>"><?= $p["published"] ? "Published" : "Draft" ?></span></td>
                  <td><?= h(format_post_date($p["created_at"])) ?></td>
                  <td class="actions">
                    <a href="admin-post-edit.php?id=<?= (int)$p["id"] ?>">Edit</a>
                    <form method="post" action="?tab=posts">
                      <input type="hidden" name="id" value="<?= (int)$p["id"] ?>" />
                      <input type="hidden" name="action" value="toggle_publish" />
                      <button type="submit" class="linklike"><?= $p["published"] ? "Unpublish" : "Publish" ?></button>
                    </form>
                    <form method="post" action="?tab=posts" onsubmit="return confirm('Delete this post? This cannot be undone.');">
                      <input type="hidden" name="id" value="<?= (int)$p["id"] ?>" />
                      <input type="hidden" name="action" value="delete" />
                      <button type="submit" class="linklike danger">Delete</button>
                    </form>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        <?php endif; ?>
      </div>
    <?php else: ?>
      <p class="count"><?= count($rows) ?> result<?= count($rows) === 1 ? "" : "s" ?><?= $q !== "" ? " for \"" . h($q) . "\"" : "" ?></p>

      <div class="table-wrap">
        <?php if (empty($rows)): ?>
          <div class="empty">No submissions yet.</div>
        <?php else: ?>
          <table>
            <thead>
              <tr><?php foreach (TABS[$tab]["cols"] as $col): ?><th><?= h(label_for($col)) ?></th><?php endforeach; ?></tr>
            </thead>
            <tbody>
              <?php foreach ($rows as $row): ?>
                <tr>
                  <?php foreach (TABS[$tab]["cols"] as $col): ?>
                    <td class="<?= $col === "message" ? "wrap-cell" : "" ?>"><?= h((string)($row[$col] ?? "")) ?></td>
                  <?php endforeach; ?>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        <?php endif; ?>
      </div>
    <?php endif; ?>
  </div>
<?php endif; ?>

</body>
</html>
