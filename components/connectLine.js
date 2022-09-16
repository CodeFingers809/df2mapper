const getOffset = (el) => {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.pageXOffset,
    top: rect.top + window.pageYOffset,
    width: rect.width || el.offsetWidth,
    height: rect.height || el.offsetHeight,
  };
};
export default function connectLine (div1, div2, thickness) {
  const off1 = getOffset(div1);
  const off2 = getOffset(div2);

  const x1 = off1.left + off1.width / 2;
  const y1 = off1.top + off1.height / 2;

  const x2 = off2.left + off2.width / 2;
  const y2 = off2.top + off2.height / 2;

  const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

  const cx = (x1 + x2) / 2 - length / 2;
  const cy = (y1 + y2) / 2 - thickness / 2;

  const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);
  return {
    left: cx,
    top: cy,
    length,
    angle,
  };
};