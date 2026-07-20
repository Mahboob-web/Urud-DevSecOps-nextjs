<?php
/**
 * Shared page chrome for the PHP-rendered blog — mirrors the React site's
 * Header/Footer markup and classes exactly (same public/site.css), so a
 * visitor moving between the React app and the PHP blog sees no seam.
 */
require_once __DIR__ . "/blog-icons.php";

function render_head(string $title, string $description, string $canonical, ?string $ogImage = null, bool $isArticle = false, array $jsonLd = []): void {
  $ogImage = $ogImage ?: SITE_URL . "/social-share.png?v=" . asset_version("social-share.png");
  $ld = array_merge([
    ["@type" => "EducationalOrganization", "name" => SITE_NAME, "description" => $description, "url" => SITE_URL],
  ], $jsonLd);
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<!-- Fonts load as direct parallel-fetched links, kept off the
     render-blocking path (see index.html for the full explanation). -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;500;700&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;500;700&display=swap" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;500;700&display=swap" /></noscript>

<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '27401886419482144');
fbq('track', 'PageView');
</script>
<!-- End Meta Pixel Code -->

<title><?= htmlspecialchars($title, ENT_QUOTES, "UTF-8") ?></title>
<meta name="description" content="<?= htmlspecialchars($description, ENT_QUOTES, "UTF-8") ?>" />
<link rel="canonical" href="<?= htmlspecialchars($canonical, ENT_QUOTES, "UTF-8") ?>" />
<meta name="theme-color" content="#1F4D3A" />
<link rel="icon" type="image/png" href="/favicon.png?v=<?= asset_version("favicon.png") ?>" />
<link rel="apple-touch-icon" href="/favicon.png?v=<?= asset_version("favicon.png") ?>" />
<link rel="manifest" href="/manifest.json" />
<link rel="stylesheet" href="/site.css?v=<?= asset_version("site.css") ?>" />
<meta property="og:site_name" content="<?= SITE_NAME ?>" />
<meta property="og:type" content="<?= $isArticle ? "article" : "website" ?>" />
<meta property="og:url" content="<?= htmlspecialchars($canonical, ENT_QUOTES, "UTF-8") ?>" />
<meta property="og:title" content="<?= htmlspecialchars($title, ENT_QUOTES, "UTF-8") ?>" />
<meta property="og:description" content="<?= htmlspecialchars($description, ENT_QUOTES, "UTF-8") ?>" />
<meta property="og:image" content="<?= htmlspecialchars($ogImage, ENT_QUOTES, "UTF-8") ?>" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="<?= htmlspecialchars($title, ENT_QUOTES, "UTF-8") ?>" />
<meta name="twitter:description" content="<?= htmlspecialchars($description, ENT_QUOTES, "UTF-8") ?>" />
<meta name="twitter:image" content="<?= htmlspecialchars($ogImage, ENT_QUOTES, "UTF-8") ?>" />
<script type="application/ld+json"><?= json_encode(["@context" => "https://schema.org", "@graph" => $ld]) ?></script>
</head>
<body>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=27401886419482144&ev=PageView&noscript=1"
  alt="" /></noscript>
<div class="mu-root">
<a class="mu-skip" href="#main-content">Skip to main content</a>
<?php
}

function render_pattern(): void {
  echo '<svg class="mu-pattern" aria-hidden="true" focusable="false"><defs><pattern id="mu-geo" width="64" height="64" patternUnits="userSpaceOnUse"><g fill="none" stroke="currentColor" stroke-width="1.1"><rect x="19" y="19" width="26" height="26" /><rect x="19" y="19" width="26" height="26" transform="rotate(45 32 32)" /><circle cx="32" cy="32" r="4.5" /></g></pattern></defs><rect width="100%" height="100%" fill="url(#mu-geo)" /></svg>';
}

function render_photo(?string $src, string $ratio, bool $overlay = false): void {
?>
  <div class="mu-photo is-ok" style="aspect-ratio:<?= htmlspecialchars($ratio, ENT_QUOTES, "UTF-8") ?>">
    <?php if ($src): ?>
      <img src="<?= htmlspecialchars($src, ENT_QUOTES, "UTF-8") ?>" alt="" loading="lazy" decoding="async" />
    <?php else: ?>
      <span class="mu-art" aria-hidden="true">
        <span class="mu-art-word mu-urdu"><?= icon("book-open", 30) ?></span>
      </span>
    <?php endif; ?>
    <?php if ($overlay): ?><span class="mu-photo-ov" aria-hidden="true"></span><?php endif; ?>
  </div>
<?php
}

function render_final_cta(): void {
?>
<section class="mu-wrap" id="final" style="padding-top:8px">
  <div class="mu-final mu-on-dark">
    <?php render_pattern(); ?>
    <div class="flourish mu-urdu" aria-hidden="true">اردو</div>
    <h2>Your first Urdu conversation is closer than you think.</h2>
    <p>Book a free trial today — meet your teacher, no card required.</p>
    <a class="mu-btn mu-btn-lg mu-btn-gold" style="position:relative" href="/?trial=1">Book a Free Trial <?= icon("arrow-right") ?></a>
  </div>
</section>
<?php
}

function render_header(string $active = "blog"): void {
  $nav = [
    ["label" => "Home", "href" => "/"],
    ["label" => "Courses", "href" => "/courses"],
    ["label" => "Pricing", "href" => "/pricing"],
    ["label" => "How to Pay", "href" => "/payment"],
    ["label" => "Blog", "href" => "/blog"],
    ["label" => "About", "href" => "/about"],
    ["label" => "Contact", "href" => "/contact"],
  ];
?>
<header class="mu-header" id="mu-site-header">
  <div class="mu-wrap">
    <nav class="mu-nav" aria-label="Primary">
      <a class="mu-brand" href="/">
        <img class="mu-brand-full" src="/logo-full-white.png?v=<?= asset_version("logo-full-white.png") ?>" alt="Speak in Urdu" width="79" height="44" />
      </a>
      <div class="mu-navlinks">
        <?php foreach ($nav as $n): $isActive = strtolower($n["label"]) === $active || ($active === "post" && $n["label"] === "Blog"); ?>
          <a class="<?= $isActive ? "active" : "" ?>" href="<?= $n["href"] ?>" <?= $isActive ? 'aria-current="page"' : "" ?>><?= $n["label"] ?></a>
        <?php endforeach; ?>
      </div>
      <div class="mu-navright">
        <a class="mu-btn mu-btn-md mu-btn-gold mu-desktop-cta" href="/?trial=1">Book Free Trial</a>
        <button class="mu-burger" id="mu-burger" aria-label="Open menu" aria-expanded="false"><?= icon("menu", 20) ?></button>
      </div>
    </nav>
    <div class="mu-mobile" id="mu-mobile-menu">
      <?php foreach ($nav as $n): ?>
        <a class="ml" href="<?= $n["href"] ?>"><?= $n["label"] ?></a>
      <?php endforeach; ?>
      <a class="mu-btn mu-btn-md mu-btn-gold mu-btn-block" href="/?trial=1">Book Free Trial</a>
    </div>
  </div>
</header>
<?php
}

function render_footer(): void {
?>
<footer class="mu-footer mu-on-dark">
  <div class="mu-wrap">
    <div class="mu-footcols">
      <div class="mu-footbrand">
        <div class="mu-brand">
          <img class="mu-brand-full" src="/logo-full-white.png?v=<?= asset_version("logo-full-white.png") ?>" alt="Speak in Urdu" width="79" height="44" />
        </div>
        <p>Live 1-on-1 Urdu classes with native teachers. Read, write, and speak beautiful Urdu — from your first letter to exam success.</p>
        <div class="mu-socials">
          <a href="https://www.instagram.com/speakinurdu/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><?= icon("instagram") ?></a>
          <a href="https://www.facebook.com/profile.php?id=61590513969029" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><?= icon("facebook") ?></a>
          <a href="https://www.youtube.com/@SpeakinUrdu" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><?= icon("youtube") ?></a>
          <a href="#" onclick="return false" aria-label="LinkedIn"><?= icon("linkedin") ?></a>
        </div>
      </div>
      <div class="mu-footcol">
        <h3>Academy</h3>
        <a class="fl" href="/about">About Us</a>
        <a class="fl" href="/courses">All Courses</a>
        <a class="fl" href="/pricing">Pricing</a>
        <a class="fl" href="/payment">How to Pay</a>
        <a class="fl" href="/blog">Blog</a>
        <a class="fl" href="/contact">Contact</a>
      </div>
      <div class="mu-footcol">
        <h3>Reach us</h3>
        <a class="fl" href="mailto:info@speakinurdu.com">info@speakinurdu.com</a>
        <a class="fl" href="tel:+923275347525">+92 327 5347525</a>
      </div>
    </div>
    <div class="mu-footbottom">
      <span>© <?= date("Y") ?> Speak in Urdu. All rights reserved.</span>
      <span class="mu-urdu" aria-hidden="true">اردو سیکھیں</span>
    </div>
  </div>
</footer>
<script>
(function(){
  var header = document.getElementById("mu-site-header");
  window.addEventListener("scroll", function(){
    header.classList.toggle("is-stuck", window.scrollY > 8);
  }, { passive: true });
  var burger = document.getElementById("mu-burger");
  var mobile = document.getElementById("mu-mobile-menu");
  burger.addEventListener("click", function(){
    var open = mobile.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();
</script>
</div>
</body>
</html>
<?php
}
