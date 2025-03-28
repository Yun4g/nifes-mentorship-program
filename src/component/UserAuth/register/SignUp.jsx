import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../lib/AuthContext';
import { userApi } from '../../../lib/api'; // Ensure this import exists for sending the email

function SignUp() {
  const [passwordType, setPasswordType] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Toggle password visibility
  const handlePasswordType = () => {
    setPasswordType(!passwordType);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);

      // Only include the data that's filled in the signup form
      const userData = {
        firstName: data.FirstName,
        lastName: data.FirstName, // Using FirstName as lastName for now since we only collect one name
        email: data.email.toLowerCase(),
        password: data.password
      };
      
      // Register the user
      const response = await registerUser(userData);
      
      // Store the user data in localStorage for later use in profile completion
      localStorage.setItem('userData', JSON.stringify({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        emailVerified: response.emailVerified || false,
        token: localStorage.getItem('token')
      }));
      
      // Send verification email
      try {
        console.log('Attempting to send verification email to:', userData.email);
        const emailResponse = await userApi.sendVerificationEmail(userData.email);
        console.log('Verification email response:', emailResponse);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        setError('Account created, but there was an issue sending the verification email. Please try again later.');
      }

      // Show success modal
      setShowModal(true);

      // Redirect based on verification status
      setTimeout(() => {
        setShowModal(false);
        if (response.emailVerified) {
          navigate('/mode-of-registering');
        } else {
          navigate('/verify-email');
        }
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      // Handle specific error messages
      if (err.message.includes('already exists')) {
        setError('This email is already registered. Please use a different email or login.');
      } else if (err.message.includes('validation failed')) {
        setError('Please check your input and try again.');
      } else {
        setError('Registration was successful but there was an issue sending the verification email. You can request a new verification email on the next page.');
        // Still show success modal and redirect
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigate('/verify-email');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex h-full">
      <div className="hidden lg:block h-full w-3/5">
        <img src="/image/close-up-people-learning-together-office 1.png" loading="lazy" className="h-full w-full object-cover" alt="" />
        <div onClick={() => navigate('/')} className="absolute top-4">
          <img src="/image/LogoAyth.png" loading="lazy" className="w-40" alt="" />
        </div>
      </div>

      {/* Right Side Form */}
      <div className="flex flex-col lg:flex-row items-center w-full lg:w-2/5 justify-center">
        <div onClick={() => navigate('/')} className="block lg:hidden bg-black py-2 px-2">
          <img src="/image/LogoAyth.png" loading="lazy" className="w-40" alt="" />
        </div>
        <div className="w-full px-6 lg:px-0 md:w-[400px]">
          <h1 className="text-2xl font-bold lg:text-[40px] text-customDarkBlue">Sign Up</h1>
          <p className="text-slate-400 text-sm mt-2">Let's Create an Account for you</p>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center gap-3">
              <div className="w-full">
                <div className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2">
                  <span>
                    <FontAwesomeIcon className="text-gray-400 text-xl" icon={faUser} />
                  </span>
                  <input
                    type="text"
                    {...register('FirstName', { 
                      required: 'This field is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters long'
                      }
                    })}
                    className="outline-none w-full"
                    placeholder="Full Name"
                  />
                </div>
                {errors.FirstName && <p className="text-red-600">{errors.FirstName.message}</p>}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2">
                <span>
                  <FontAwesomeIcon className="text-gray-400 text-xl" icon={faEnvelope} />
                </span>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'This field is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="outline-none w-full"
                  placeholder="Email"
                />
              </div>
              {errors.email && <p className="text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
                <div className="flex items-center justify-center gap-3">
                  <span>
                    <FontAwesomeIcon className="text-gray-400 text-xl" icon={faLock} />
                  </span>
                  <input
                    type={passwordType ? 'text' : 'password'}
                    {...register('password', {
                      required: 'This field is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long',
                      },
                    })}
                    className="outline-none w-full"
                    placeholder="Enter Password"
                  />
                </div>
                <span onClick={handlePasswordType} className="cursor-pointer">
                  {passwordType ? (
                    <FontAwesomeIcon className="text-gray-400 text-lg" icon={faEye} />
                  ) : (
                    <FontAwesomeIcon className="text-gray-400 text-lg" icon={faEyeSlash} />
                  )}
                </span>
              </div>
              {errors.password && <p className="text-red-600">{errors.password.message}</p>}
            </div>

            <p className="mt-6 text-gray-600">Your password must have at least 6 characters</p>

            <div className="mt-6 flex items-center gap-4">
              <input
                type="checkbox"
                {...register('terms', { required: 'Terms and conditions are required' })}
                className="accent-customOrange text-white cursor-pointer w-4 h-4"
              />
              <p className="text-sm font-medium text-slate-400">
                By creating an account means you agree to the{' '}
                <Link to="/terms" className="text-customOrange hover:text-orange-600">
                  Terms & Conditions
                </Link>{' '}
                and our{' '}
                <Link to="/privacy" className="text-customOrange hover:text-orange-600">
                  Privacy Policy
                </Link>
              </p>
            </div>
            {errors.terms && <p className="text-red-600">{errors.terms.message}</p>}

            <div className="mt-4">
              <button 
                type="submit" 
                disabled={loading}
                className={`text-white bg-customOrange w-full h-11 lg:h-14 rounded-lg cursor-pointer hover:bg-orange-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Account...' : 'Sign up'}
              </button>
            </div>
          </form>

          <p className="mt-[30px] text-center text-sm font-medium text-customDarkBlue">
            Already have an account?
            <span className="text-customOrange ml-1">
              <Link to={'/login'}>Login</Link>
            </span>
          </p>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Account Created</h2>
            <p>Your account has been created successfully!</p>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => {
                  setShowModal(false);
                  navigate('/verify-email');
                }} 
                className="bg-customOrange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SignUp;