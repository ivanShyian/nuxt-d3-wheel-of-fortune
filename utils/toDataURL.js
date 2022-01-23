export default function (src, outputFormat) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('CANVAS')
      const ctx = canvas.getContext('2d')
      canvas.height = img.naturalHeight
      canvas.width = img.naturalWidth
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL(outputFormat))
    }
    img.src = src
    if (img.complete || img.complete === undefined) {
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
      img.src = src
    }
  })
}
