import { Link, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Code2, Cloud, Zap, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 hover-glow">
            <Code2 className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold animate-gradient bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 gradient-text">
              Cloud IDE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="hover:bg-blue-900/20">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-background to-background"></div>
        <div className="container relative z-10 flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="relative group">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl animate-gradient bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 gradient-text hover-glow">
              Code Anywhere, Anytime
              <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-400/10 via-blue-500/10 to-blue-600/10 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </h1>
          </div>
          <p className="mt-8 max-w-[42rem] text-muted-foreground sm:text-xl">
            A powerful cloud-based IDE that lets you code from any device. Collaborate in real-time,
            deploy instantly, and focus on what matters most - your code.
          </p>
          <div className="mt-8 flex gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 hover-glow">
                Start Coding Now
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-blue-700/20 hover:bg-blue-900/20 hover-glow">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 bg-background/60">
        <div className="container py-24">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-xl border border-blue-800/20 bg-blue-950/10 p-6 transition-all hover:bg-blue-900/20 hover:shadow-lg hover:shadow-blue-500/5">
              <div className="mb-4 mx-auto w-fit rounded-full bg-blue-950/50 p-4">
                <Cloud className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-blue-100">Cloud-Based</h3>
              <p className="text-center text-blue-200/70">
                Access your development environment from anywhere with an internet connection.
              </p>
            </div>
            <div className="group rounded-xl border border-blue-800/20 bg-blue-950/10 p-6 transition-all hover:bg-blue-900/20 hover:shadow-lg hover:shadow-blue-500/5">
              <div className="mb-4 mx-auto w-fit rounded-full bg-blue-950/50 p-4">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-blue-100">Lightning Fast</h3>
              <p className="text-center text-blue-200/70">
                Optimized performance with instant file access and real-time collaboration.
              </p>
            </div>
            <div className="group rounded-xl border border-blue-800/20 bg-blue-950/10 p-6 transition-all hover:bg-blue-900/20 hover:shadow-lg hover:shadow-blue-500/5">
              <div className="mb-4 mx-auto w-fit rounded-full bg-blue-950/50 p-4">
                <Code2 className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-blue-100">Powerful Editor</h3>
              <p className="text-center text-blue-200/70">
                Advanced code editing features with syntax highlighting and intelligent completion.
              </p>
            </div>
            <div className="group rounded-xl border border-blue-800/20 bg-blue-950/10 p-6 transition-all hover:bg-blue-900/20 hover:shadow-lg hover:shadow-blue-500/5">
              <div className="mb-4 mx-auto w-fit rounded-full bg-blue-950/50 p-4">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-blue-100">Secure</h3>
              <p className="text-center text-blue-200/70">
                Enterprise-grade security with end-to-end encryption and automated backups.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}