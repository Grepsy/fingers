function fastblur(ctx, passes) {
    var i, x, y;
    var d = 3;
    ctx.globalAlpha = 0.125;
    for (i = 1; i <= passes; i++) {
      for (y = -d; y <= d; y +=d) {
        for (x = -d; x <= d; x += d) {
            // Place eight versions of the image over the original
            // image, each with 1/8th of full opacity.  The images are
            // placed around the original image like a square filter.
            // This gives the impression the image has been blurred,
            // but it's done at native browser speed, thus making it
            // much faster than writing a proper blur filter in
            // Javascript.
            ctx.drawImage(ctx.canvas, x, y);
        }
      }
    }
    ctx.globalAlpha = 1.0;
}

function blur (img, passes) {
  // Blur as described in article http://web.archive.org/web/20060718054020/
  // http://www.acm.uiuc.edu/siggraph/workshops/wjarosz_convolution_2001.pdf
  // Increase passes for blurrier image
  var i, j, k, n, w = img.width, h = img.height, im = img.data,
    rounds = passes || 0,
    pos = step = jump = inner = outer = arr = 0;

  for(n=0;n<rounds;n++) {
    for(var m=0;m<2;m++) { // First blur rows, then columns
      if (m) {
        // Values for column blurring
        outer = w; inner = h;
        step = w*4;
      } else {
        // Row blurring
        outer = h; inner = w;
        step = 4;
      }
      for (i=0; i < outer; i++) {
        jump = m === 0 ? i*w*4 : 4*i;
        for (k=0;k<3;k++) { // Calculate for every color: red, green and blue
          pos = jump+k;
          arr = 0;
          // First pixel in line
          arr = im[pos]+im[pos+step]+im[pos+step*2];
          im[pos] = Math.floor(arr/3);
          // Second
          arr += im[pos+step*3];
          im[pos+step] = Math.floor(arr/4);
          // Third and last. Kernel complete and other pixels in line can work from there.
          arr += im[pos+step*4];
          im[pos+step*2] = Math.floor(arr/5);
          for (j = 3; j < inner-2; j++) {
            arr = Math.max(0, arr - im[pos+(j-2)*step] + im[pos+(j+2)*step]);
            im[pos+j*step] = Math.floor(arr/5);
          }
          // j is now inner - 2 (1 bigger)
          // End of line needs special handling like start of it
          arr -= im[pos+(j-2)*step];
          im[pos+j*step] = Math.floor(arr/4);
          arr -= im[pos+(j-1)*step];
          im[pos+(j+1)*step] = Math.floor(arr/3);
        }
      }
    }
  }
  return img;
}