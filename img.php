<?php
/**
 * On-server image pipeline.
 * ---------------------------------------------------------------------------
 * Lets anyone replace the site's photography from the hosting File Manager,
 * with no build step and no tooling: drop a photo in assets/photos/_src/ named
 * after its slot (hero.jpg, mri.jpg, ct.jpg…) and this script produces every
 * size and format the pages ask for, cropped to the aspect the layout expects.
 *
 * AFTER UPLOADING PHOTOS, open this once in the browser:
 *     https://your-domain/img.php?rebuild=all
 * It clears the old sizes so the new photo takes over. That is the only step.
 *
 * Requests for a missing size land here through .htaccess, get generated,
 * cached to disk and served. From then on Apache serves the file directly.
 */

const SRC_DIR   = __DIR__ . '/assets/photos/_src';
const OUT_DIR   = __DIR__ . '/assets/photos';
const QUALITY   = 82;
const MAX_WIDTH = 2560;

// Aspect each slot is composed for, mirroring photos.json.
const SLOTS = [
    'hero' => '16:10', 'hero-portrait' => '1:2', 'lobby' => '16:10',
    'tech' => '1:1',   'mri' => '4:5',           'ct' => '16:10',
    'mammography' => '4:5', 'ultrasound' => '4:5', 'xray' => '16:10',
    'cardiac' => '16:10',   'team' => '4:5',
];

function fail($code, $msg) {
    http_response_code($code);
    header('Content-Type: text/plain; charset=utf-8');
    exit($msg . "\n");
}

function source_for($slot) {
    foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
        $p = SRC_DIR . '/' . $slot . '.' . $ext;
        if (is_file($p)) return $p;
    }
    return null;
}

// --- housekeeping: drop the cached sizes so new uploads take effect ---------
if (isset($_GET['rebuild'])) {
    header('Content-Type: text/plain; charset=utf-8');
    $want = $_GET['rebuild'];
    $slots = $want === 'all' ? array_keys(SLOTS) : [$want];
    $removed = 0;
    foreach ($slots as $slot) {
        if (!isset(SLOTS[$slot])) continue;
        foreach (glob(OUT_DIR . '/' . $slot . '-*.{jpg,webp}', GLOB_BRACE) ?: [] as $f) {
            if (@unlink($f)) $removed++;
        }
        @unlink(OUT_DIR . '/' . $slot . '.jpg');
    }
    $ready = [];
    foreach (array_keys(SLOTS) as $slot) {
        if (source_for($slot)) $ready[] = $slot;
    }
    echo "Cleared $removed cached file(s).\n";
    echo "Photos found in _src/: " . ($ready ? implode(', ', $ready) : '(none yet)') . "\n";
    echo "Reload the site — the new sizes are generated on first request.\n";
    exit;
}

// --- generate one size ------------------------------------------------------
$slot = preg_replace('/[^a-z0-9-]/', '', $_GET['slot'] ?? '');
$width = min(MAX_WIDTH, max(64, (int) ($_GET['w'] ?? 0)));
$fmt = ($_GET['f'] ?? 'jpg') === 'webp' ? 'webp' : 'jpg';

if (!isset(SLOTS[$slot]) || !$width) fail(404, 'Unknown image.');
if (!extension_loaded('gd'))         fail(500, 'PHP GD is not available on this server.');

$src = source_for($slot);
if (!$src) fail(404, 'No photo in assets/photos/_src/ for "' . $slot . '".');

$info = @getimagesize($src);
if (!$info) fail(500, 'That file is not a readable image.');

switch ($info[2]) {
    case IMAGETYPE_JPEG: $im = @imagecreatefromjpeg($src); break;
    case IMAGETYPE_PNG:  $im = @imagecreatefrompng($src);  break;
    case IMAGETYPE_WEBP: $im = @imagecreatefromwebp($src); break;
    default: fail(500, 'Use JPG, PNG or WebP.');
}
if (!$im) fail(500, 'Could not open the image.');

[$rw, $rh] = array_map('intval', explode(':', SLOTS[$slot]));
$target = $rw / $rh;
$w = imagesx($im);
$h = imagesy($im);

// centre-crop to the slot's aspect
if ($w / $h > $target) {
    $nw = (int) round($h * $target);
    $sx = (int) (($w - $nw) / 2); $sy = 0; $sw = $nw; $sh = $h;
} else {
    $nh = (int) round($w / $target);
    $sx = 0; $sy = (int) (($h - $nh) / 2); $sw = $w; $sh = $nh;
}

$outW = min($width, $sw);
$outH = (int) round($outW / $target);
$dst = imagecreatetruecolor($outW, $outH);
imageinterlace($dst, 1);
imagecopyresampled($dst, $im, 0, 0, $sx, $sy, $outW, $outH, $sw, $sh);
imagedestroy($im);

@mkdir(OUT_DIR, 0755, true);
$cache = OUT_DIR . '/' . $slot . '-' . $width . '.' . $fmt;

ob_start();
if ($fmt === 'webp' && function_exists('imagewebp')) {
    imagewebp($dst, null, QUALITY);
    $type = 'image/webp';
} else {
    imagejpeg($dst, null, QUALITY);
    $type = 'image/jpeg';
    $cache = OUT_DIR . '/' . $slot . '-' . $width . '.jpg';
}
$bytes = ob_get_clean();
imagedestroy($dst);

@file_put_contents($cache, $bytes, LOCK_EX);
// the plain fallback the <img src> points at
if ($width === 1440) @file_put_contents(OUT_DIR . '/' . $slot . '.jpg', $bytes, LOCK_EX);

header('Content-Type: ' . $type);
header('Content-Length: ' . strlen($bytes));
header('Cache-Control: public, max-age=31536000, immutable');
echo $bytes;
