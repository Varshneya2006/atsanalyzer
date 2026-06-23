export default function Footer() {
  return (
    <footer className="border-t border-line py-10 font-mono text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} scanline. built to pass the bots.</p>
        <p className="flex items-center gap-1">
          <span className="text-phosphor">●</span> system operational
        </p>
      </div>
    </footer>
  );
}
