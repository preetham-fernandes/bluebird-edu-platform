import { ThemeToggle } from "@/components/theme-toggle"


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold mb-8">Absolutely Desi | Ecommerce store for Indian wear</h1>
    </main>
  );
}
