export function strokesToSvg(strokes, width, height, background = "#071120") {
  const body = strokes
    .map((stroke) => {
      if (!stroke.points?.length) {
        return "";
      }
      const path = stroke.points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(" ");

      return `<path d="${path}" stroke="${stroke.color}" stroke-width="${stroke.size}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${stroke.tool_type === "eraser" ? 0 : 1}" />`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${background}" />${body}</svg>`;
}

export function downloadDataUrl(dataUrl, filename) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

export function downloadFromUrl(url, filename = "") {
  const anchor = document.createElement("a");
  anchor.href = url;
  if (filename) {
    anchor.download = filename;
  }
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  anchor.click();
}
