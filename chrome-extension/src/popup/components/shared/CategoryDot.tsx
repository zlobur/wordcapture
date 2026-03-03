export function CategoryDot({ color, size = 8 }: { color?: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 2,
      background: color || "#475569", flexShrink: 0,
    }} />
  );
}
