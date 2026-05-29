export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} OmixBooks. All rights reserved.</p>
      </div>
    </footer>
  );
}
