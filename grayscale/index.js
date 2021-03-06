const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const [width, height] = [canvas.width, canvas.height];

const img = new Image();
img.src = './waterlily.png';
img.crossOrigin = 'anonymous';
img.onload = () => {
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const arraySize = (width * height * 4) >>> 0;
  const nPages = ((arraySize + 0xffff) & ~0xffff) >>> 16;
  const memory = new WebAssembly.Memory({ initial: nPages });

  WebAssembly
    .instantiateStreaming(fetch('./build/optimized.wasm'), {
      env: {
        memory, // npm run asbuild:optimized -- --importMemory
        abort: (_msg, _file, line, column) => console.error(`Abort at ${line}:${column}`),
        seed: () => new Date().getTime()
      }
    })
    .then(({instance}) => {
      // load bytes into memory
      const bytes = new Uint8ClampedArray(memory.buffer);

      for (let i = 0; i < data.length; i++)
        bytes[i] = data[i];

      instance.exports.convertToGrayscale(width, height, 80);
  
      // load data from memory
      for (let i = 0; i < bytes.length; i++) 
         data[i] = bytes[i];

      ctx.putImageData(imageData, 0, 0);
    });
}