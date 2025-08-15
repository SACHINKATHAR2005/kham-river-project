export function WaveAnimation({ color }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
      <div className={`wave ${color}`}>
        <div className="wave-inner" />
      </div>
    </div>
  );
}