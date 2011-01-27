$(document).ready(function() {
  var view = document.getElementById('surface').getContext('2d'),
      back = document.createElement('canvas').getContext('2d'),
      glass = document.createElement('canvas').getContext('2d'),
      steam = document.createElement('canvas').getContext('2d');

  loadImage(back, 'images/autumn_storm.jpg');
  // back.canvas.width = 1024;
  // back.canvas.height = 768;
  // back.fillStyle = rgba(255,0,0, 255);
  // back.fillRect(0,0, 1024, 768);
  loadImage(steam, 'images/steam.jpg', function() {
    loadImage(glass, 'images/autumn_storm.jpg', function() {
      fastblur(glass, 3);
      hardlight(glass, steam);
      view.drawImage(glass.canvas, 0, 0);
    });
  });
  view.canvas.addEventListener('touchmove', function(event) {
    var x, y,
        w = 50, h = 50;

    event.preventDefault();
    for (var i = 0; i < event.targetTouches.length; i++) {
      x = event.targetTouches[i].pageX - w / 2;
      y = event.targetTouches[i].pageY - h / 2;

      blendRadial(view, back, x, y, w, h);
    }
  }, false);
});

function hardlight(dstctx, srcctx) {
  var src = srcctx.getImageData(0, 0, srcctx.canvas.width, srcctx.canvas.height), m = src.data,
      dst = dstctx.getImageData(0, 0, srcctx.canvas.width, srcctx.canvas.height), i = dst.data,
      p = src.width * src.height * 4;

  while (p -= 4) {
    i[p  ] = m[p  ] <= 128 ? (2 * m[p  ] * i[p  ]) / 256 : 255 - (255 - 2 * (m[p  ] - 128)) * (255 - i[p  ]) / 256;
    i[p+1] = m[p+1] <= 128 ? (2 * m[p+1] * i[p+1]) / 256 : 255 - (255 - 2 * (m[p+1] - 128)) * (255 - i[p+1]) / 256;
    i[p+2] = m[p+2] <= 128 ? (2 * m[p+2] * i[p+2]) / 256 : 255 - (255 - 2 * (m[p+2] - 128)) * (255 - i[p+2]) / 256;
  }
  dstctx.putImageData(dst, 0, 0);
}

function blendRadial(dstctx, srcctx, sx, sy, w, h) {
  var width = w,
      height = h;
  var src = srcctx.getImageData(sx, sy, width, height),
      dst = dstctx.getImageData(sx, sy, width, height),
      p = src.width * src.height * 4;

  var r,x,y,M,K,cx,cy;

  // the center of the surface
  cx = width  / 2;
  cy = height / 2;
  // compute max distance M from center
  M = Math.sqrt(cx*cx+cy*cy);
  K = 1 / M;
  var ce; // the exact alpha computed for each square
  for (var j = 0; j < height; j++) {
    for (var i = 0; i < width; i++) {
      // coordinates relative to center, shifted to pixel centers
      x = i - cx + 0.5;
      y = j - cy + 0.5;
      r = Math.sqrt(x * x + y * y); // the distance
      // the "exact" color to place at this pixel
      ce = r * K * 1.5;
      if (ce > 1 || ce < 0) continue;
      p = ((j * width) + i) * 4;
      dst.data[p  ] = src.data[p  ] + (dst.data[p  ] - src.data[p  ]) * ce;
      dst.data[p+1] = src.data[p+1] + (dst.data[p+1] - src.data[p+1]) * ce;
      dst.data[p+2] = src.data[p+2] + (dst.data[p+2] - src.data[p+2]) * ce;
      dst.data[p+3] = 255;
    }
  }
  dstctx.putImageData(dst, sx, sy);
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