import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Code2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      await registerUser(data);
      setIsRegistered(true);
      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  if (isRegistered) {
    return (
      <div className="gradient-bg min-h-screen">
        <div className="auth-container">
          <div className="auth-card">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Please verify your email</h1>
              <p className="text-muted-foreground">
                We've sent a verification link to your email address.
                Please check your inbox (and spam folder) and click the link to activate your account.
              </p>
              <p className="text-sm text-muted-foreground">
                You will be redirected to the login page in a few seconds...
              </p>
            </div>
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
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">Start your coding journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="auth-label">Name</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="auth-input"
                placeholder="Enter your name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name.message as string}</p>
              )}
            </div>

            <div>
              <label className="auth-label">Email</label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="auth-input"
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email.message as string}</p>
              )}
            </div>

            <div>
              <label className="auth-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  className="auth-input"
                  placeholder="Create a password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password.message as string}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-button bg-primary hover:bg-primary/90 glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 