window.addEventListener('DOMContentLoaded', function() {
  var view = document.getElementById('surface').getContext('2d'),
      back = document.createElement('canvas').getContext('2d'),
      glass = document.createElement('canvas').getContext('2d'),
      steam = document.createElement('canvas').getContext('2d'),
      skipSteam = 0;

  var bw = 40, bh = 40;
  var backdrop = 'images/adam.png';

  loadImage(back, backdrop);
  // back.canvas.width = 1024;
  // back.canvas.height = 768;
  // back.fillStyle = rgba(255,0,0, 255);
  // back.fillRect(0,0, 1024, 768);
  loadImage(steam, 'images/steam.jpg', function() {
    loadImage(glass, backdrop, function() {
      fastblur(glass, 15);
      hardlight(glass, steam);
      view.drawImage(glass.canvas, 0, 0);
    });
  });

  function touch(x, y) {
    if (skipSteam < 4) skipSteam = 4;
    blendRadial(view, back, x, y, bw, bh, 1);
  }

  view.canvas.addEventListener('mousemove', function(event) {
    event.preventDefault();
    touch(event.pageX, event.pageY);
  }, false);

  view.canvas.addEventListener('touchmove', function(event) {
    var x, y;
    event.preventDefault();
    for (var i = 0; i < event.targetTouches.length; i++) {
      x = event.targetTouches[i].pageX;
      y = event.targetTouches[i].pageY;
      touch(x, y);
    }
  }, false);

  setInterval(function() {
    if (skipSteam-- > 0) return;
    fastblend(view, glass, 0.1);
  }, 500);
}, false);

function hardlight(dstctx, srcctx) {
  var src = srcctx.getImageData(0, 0, srcctx.canvas.width, srcctx.canvas.height), m = src.data,
      dst = dstctx.getImageData(0, 0, srcctx.canvas.width, srcctx.canvas.height), i = dst.data,
      p = src.width * src.height * 4;

  while (p--) {
    i[--p] = m[p] <= 128 ? (2 * m[p] * i[p]) / 256 : 255 - (255 - 2 * (m[p] - 128)) * (255 - i[p]) / 256;
    i[--p] = m[p] <= 128 ? (2 * m[p] * i[p]) / 256 : 255 - (255 - 2 * (m[p] - 128)) * (255 - i[p]) / 256;
    i[--p] = m[p] <= 128 ? (2 * m[p] * i[p]) / 256 : 255 - (255 - 2 * (m[p] - 128)) * (255 - i[p]) / 256;
  }
  dstctx.putImageData(dst, 0, 0);
}

function fastblend(dstctx, srcctx, alpha) {
  dstctx.save();
  dstctx.globalAlpha = alpha;
  dstctx.drawImage(srcctx.canvas, 0 ,0);
  dstctx.restore();
}

function blend(dstctx, srcctx, alpha) {
  var src = srcctx.getImageData(0, 0, srcctx.canvas.width, srcctx.canvas.height), s = src.data,
      dst = dstctx.getImageData(0, 0, srcctx.canvas.width, srcctx.canvas.height), d = dst.data,
      p = src.width * src.height * 4,
      da = 1 - alpha;

  while (p--) {
    d[--p] = d[p] * da + s[p] * alpha;
    d[--p] = d[p] * da + s[p] * alpha;
    d[--p] = d[p] * da + s[p] * alpha;
  }
  dstctx.putImageData(dst, 0, 0);
}

function blendRadial(dstctx, srcctx, sx, sy, w, h, alpha) {
  var r,x,y,M,K,cx,cy,a,sa,da,p;
  alpha = alpha || 1;
  cx = w / 2; // the center of the surface
  cy = h / 2;
  p  = w * h* 4;;

  var src = srcctx.getImageData(sx - cx, sy - cy, w, h), s = src.data,
      dst = dstctx.getImageData(sx - cx, sy - cy, w, h), d = dst.data;

  M = cx;    // max distance from center
  K = (1 / M); // step size
  while (p--) {
    y = (p/4 / w) - cy + 0.5;
    x = (p/4 % w) - cx + 0.5;
    r = Math.sqrt(x * x + y * y); // the distance
    a = 1 - r * K; // the exact alpha
    if (a < 0) a = 0;
    sa = a * alpha;
    da = 1 - sa;
    d[--p] = d[p] * da + s[p] * sa;
    d[--p] = d[p] * da + s[p] * sa;
    d[--p] = d[p] * da + s[p] * sa;
  }

  dstctx.putImageData(dst, sx - cx, sy - cy);
}

function rgba(r, g, b, a) {
  return 'rgba('+r+','+g+','+b+','+a+')';
}

function loadImage(ctx, src, finished) {
  var img = new Image();
  img.onload = function() {
    ctx.canvas.width = img.width;
    ctx.canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    if (finished) finished();
  }
  img.src = src;
}