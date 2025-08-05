import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      
      setToast({
        show: true,
        message: 'Password reset email sent! Please check your inbox.',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to send reset email. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Link
        to="/login"
        className="absolute top-4 left-4 p-2 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-1" />
        <span>Back to Login</span>
      </Link>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">AM</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">AuraMarket</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
          <p className="text-gray-600">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default ForgotPasswordPage;