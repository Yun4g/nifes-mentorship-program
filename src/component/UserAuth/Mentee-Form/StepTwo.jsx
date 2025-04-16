import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import React, { useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useForm } from 'react-hook-form';
import { userApi } from '@/lib/api';

function StepTwo() {
  const { handleIncreament, handleDecreament } = useContext(GlobalContext);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const detailsForm = watch();

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const stepTwoData = {
      Title: detailsForm.Title,
      department: detailsForm.department,
      linkedIn: detailsForm.linkedIn,
      twitter: detailsForm.twitter,
      instagram: detailsForm.instagram,
    };
    localStorage.setItem('stepTwoData', JSON.stringify(stepTwoData));
  }, [detailsForm]);

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('stepTwoData');
    if (savedFormData) {
      const parsedFormData = JSON.parse(savedFormData);
      setValue('Title', parsedFormData.Title);
      setValue('department', parsedFormData.department);
      setValue('linkedIn', parsedFormData.linkedIn);
      setValue('twitter', parsedFormData.twitter);
      setValue('instagram', parsedFormData.instagram);
    }
  }, [setValue]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Validate required fields
      if (!data.Title || !data.department) {
        alert('Please fill in all required fields.');
        return;
      }

      // Send data to the backend
      await userApi.updateProfileStep2({
        title: data.Title,
        department: data.department,
        social: {
          linkedIn: data.linkedIn,
          twitter: data.twitter,
          instagram: data.instagram,
        },
        role: 'mentee',
      });

      handleIncreament();
    } catch (error) {
      console.error('Error updating profile step 2:', error);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="text-center lg:text-start w-[300px] lg:w-[400px]">
      {/* Back Button */}
      <div onClick={handleDecreament}>
        <button className="w-10 flex justify-center items-center text-slate-200 h-10 bg-slate-400 rounded-full">
          <FontAwesomeIcon className="text-2xl" icon={faArrowLeft} />
        </button>
      </div>

      {/* Step Indicator */}
      <p className="text-base text-center font-medium mt-4 lg:mt-6">STEP 2 of 4</p>

      {/* Progress Bar */}
      <progress className="bg-customOrange h-2" value="40" max="100"></progress>

      {/* Form Title */}
      <h1 className="mt-7 text-xl lg:text-[36px] font-medium">Complete Profile Details</h1>

      {/* Form */}
      <form className="flex gap-4 flex-col mt-10" onSubmit={handleSubmit(onSubmit)}>
        {/* Title Field */}
        <div>
          <div className="flex relative items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2">
            <input
              type="text"
              {...register('Title', { required: 'Title is required' })}
              className="outline-none w-full"
              placeholder="E.G Doctor or student"
            />
            <p className="absolute -top-3 left-4 bg-white px-1 text-base font-bold text-slate-400">
              Your profession
            </p>
          </div>
          {errors.Title && <p className="text-red-600">{errors.Title.message}</p>}
        </div>

        {/* Department Field */}
        <div>
          <div className="flex relative items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2">
            <input
              type="text"
              {...register('department', { required: 'Department is required' })}
              className="outline-none w-full"
              placeholder="E.G Computer Science"
            />
            <p className="absolute -top-3 left-4 bg-white px-1 text-base font-bold text-slate-400">
              Education
            </p>
          </div>
          {errors.department && <p className="text-red-600">{errors.department.message}</p>}
        </div>

        {/* Social Media Links */}
        <div>
          <p className="text-lg font-medium text-cyan-600 mb-2">Social Media Links</p>
          
          {/* LinkedIn */}
          <div className="flex relative items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mb-2">
            <input
              type="url"
              {...register('linkedIn')}
              className="outline-none w-full"
              placeholder="LinkedIn URL"
            />
          </div>

          {/* Twitter */}
          <div className="flex relative items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mb-2">
            <input
              type="url"
              {...register('twitter')}
              className="outline-none w-full"
              placeholder="Twitter URL"
            />
          </div>

          {/* Instagram */}
          <div className="flex relative items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mb-2">
            <input
              type="url"
              {...register('instagram')}
              className="outline-none w-full"
              placeholder="Instagram URL"
            />
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          className="mt-4 w-full h-11 lg:h-14 rounded-lg cursor-pointer text-white bg-customOrange"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export default StepTwo;