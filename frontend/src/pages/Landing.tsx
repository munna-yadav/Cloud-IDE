import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Code2, Cloud, Zap, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col gradient-bg">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Cloud IDE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90 rounded-b-md">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 dots-bg">
        <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Code Anywhere, Anytime
          </h1>
          <p className="max-w-[42rem] text-muted-foreground sm:text-xl">
            A powerful cloud-based IDE that lets you code from any device. Collaborate in real-time,
            deploy instantly, and focus on what matters most - your code.
          </p>
          <div className="flex gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 glow rounded-button">
                Start Coding Now
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/10">
        <div className="container py-24">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-effect hover-card rounded-xl p-6">
              <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-4">
                <Cloud className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Cloud-Based</h3>
              <p className="text-muted-foreground text-center">
                Access your development environment from anywhere with an internet connection.
              </p>
            </div>
            <div className="glass-effect hover-card rounded-xl p-6">
              <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground text-center">
                Optimized performance with instant file access and real-time collaboration.
              </p>
            </div>
            <div className="glass-effect hover-card rounded-xl p-6">
              <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-4">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Powerful Editor</h3>
              <p className="text-muted-foreground text-center">
                Advanced code editing features with syntax highlighting and intelligent completion.
              </p>
            </div>
            <div className="glass-effect hover-card rounded-xl p-6">
              <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Secure</h3>
              <p className="text-muted-foreground text-center">
                Enterprise-grade security with encrypted connections and secure file storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Cloud IDE
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 