import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Code2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6" />
          <span className="text-xl font-bold">Cloud IDE</span>
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  );
} 