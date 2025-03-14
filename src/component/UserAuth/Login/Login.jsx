import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

function Login() {
  const [passwordType, setPasswordType] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();


  const formData = watch();


  useEffect(() => {
    localStorage.setItem('loginFormData', JSON.stringify(formData));
  }, [formData]);

  
  useEffect(() => {
    const savedFormData = localStorage.getItem('loginFormData');
    if (savedFormData) {
      const parsedFormData = JSON.parse(savedFormData);
      setValue('email', parsedFormData.email);
      setValue('password', parsedFormData.password);
    }
  }, [setValue]);

  const handlePasswordType = () => {
    setPasswordType(!passwordType);
  };

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    
  };

  return (
    <section className="relative flex h-full">
      <div className="hidden lg:block h-full w-3/5">
        <img src="/image/people-office-work-day 1.png" className="h-full w-full object-cover" alt="" />
        <div className="absolute top-4">
          <img src="/image/LogoAyth.png" className="w-64" alt="" />
        </div>
      </div>

      <div className="flex items-center w-full lg:w-2/5 justify-center">
        <div className="w-full px-6 lg:px-0 md:w-[400px]">
          <h1 className="text-[40px] text-customDarkBlue">Sign in</h1>
          <p className="text-slate-400 text-sm mt-2">Welcome back! Please enter your details</p>

          <form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <div className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2">
                <span>
                  <FontAwesomeIcon className="text-gray-400 text-xl" icon={faEnvelope} />
                </span>
                <input
                  type="email"
                  {...register('email', { required: 'This field is required' })}
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
                    {...register('password', { required: 'This field is required' })}
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

            {/* Submit Button */}
            <div className="mt-4">
              <button type="submit" className="text-white bg-customOrange w-full h-14 rounded-lg cursor-pointer">
                Sign in
              </button>
            </div>
          </form>

          {/* Forgot Password and Sign Up Links */}
          <div className="flex justify-between mt-9">
            <Link to="/forgot-password" className="text-sm text-customOrange">
              Forgot Password
            </Link>
            <p className="text-sm">
              Don't have an account?{' '}
              <span className="text-customOrange">
                <Link to="/signup">Sign up</Link>
              </span>
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="flex items-center gap-2 mt-4 cursor-pointer">
            <button className="border-2 w-1/2 font-medium text-sm rounded-lg flex items-center  gap-1 md:gap-2  p-2 md:p-4 ">
              <span>
                <img src="/image/Icongoogle.png" className="w-4 h-4" alt="" />
              </span>
              Continue with Google
            </button>
            <button className="w-1/2 border-2  font-medium  text-sm flex items-center gap-1 md:gap-2 rounded-lg p-2 md:p-4">
              <span>
                <img src="/image/IconApple.png" alt="" className="w-4 h-4" />
              </span>
              Continue with Apple
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;