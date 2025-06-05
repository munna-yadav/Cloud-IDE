import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';
import { Code2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setError('Verification token is missing');
        return;
      }

      try {
        await auth.verifyEmail(token);
        setStatus('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setError(error.response?.data?.error || 'Failed to verify email');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="gradient-bg min-h-screen">
      <div className="auth-container">
        <div className="auth-card">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Code2 className="h-6 w-6 text-primary" />
            </div>

            {status === 'verifying' && (
              <>
                <h1 className="text-2xl font-bold">Verifying your email</h1>
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <h1 className="text-2xl font-bold">Email verified!</h1>
                <p className="text-muted-foreground">
                  Your email has been successfully verified.
                  You will be redirected to login in a few seconds...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-bold">Verification failed</h1>
                <p className="text-destructive">{error}</p>
                <Button
                  onClick={() => navigate('/login')}
                  className="mt-4"
                >
                  Go to Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 