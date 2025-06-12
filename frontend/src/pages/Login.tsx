import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Code2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { auth } from '../lib/api';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await login(data);
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsSubmittingForgot(true);
      await auth.forgotPassword(forgotPasswordEmail);
      toast.success('Password reset instructions have been sent to your email');
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to process request. Please try again.');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="gradient-bg min-h-screen">
        <div className="auth-container">
          <div className="auth-card">
            <div className="flex flex-col items-center mb-8">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <Code2 className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Cloud IDE
                </span>
              </Link>
              <h1 className="text-2xl font-bold">Reset Password</h1>
              <p className="text-muted-foreground">Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  disabled={isSubmittingForgot}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-button bg-primary hover:bg-primary/90 glow"
                disabled={isSubmittingForgot}
              >
                {isSubmittingForgot ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-primary hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen">
      <div className="auth-container">
        <div className="auth-card">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Code2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Cloud IDE
              </span>
            </Link>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="auth-label">Email</label>
              <input
                type="email"
                {...register('email', { required: true })}
                className="auth-input"
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">Email is required</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="auth-label">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', { required: true })}
                  className="auth-input"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">Password is required</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-button bg-primary hover:bg-primary/90 glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 