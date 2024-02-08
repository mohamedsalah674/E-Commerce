import Link from 'next/link';
 
import React from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { Context } from '../context';
 import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  URL: Yup.string().url('Invalid URL').required('URL is required'),
});

const signup = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Context);

  console.log('STATE', state);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { email, URL } = values;
      const { data } = await axios.post(
        '/api/users/signup',
        {
          email,
          URL,
        }
      );
      dispatch({
        type: 'SIGNUP',
        payload: data,
      });

      toast.success('Verification code has been sent to your email', {
        duration: 1000,
        position: 'top-center',
        style: {
          background: '#2E7D32',
          color: '#fff',
          fontSize: '20px',
        },
      });
      router.push('/completesignup');

      console.log('Response back', data);
    } catch (err) {
      toast.error(err.response.data.errors[0].message, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#D32F2F',
          color: '#fff',
          fontSize: '20px',
        },
      });
      console.log('error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="bg-white h-screen overflow-hidden flex items-center justify-center">
    <div className=" bg-sky-400 absolute bg-cover top-0 left-0 bg-gradient-to-b from-blue-900 via-blue-900 to-bg-blue-900 bottom-0 leading-5 h-full w-full overflow-hidden"></div>
    <div className="relative xl:lg:mt-4 sm:mt-36 max-sm:my-auto  max-sm:py-8  max-sm:mx-auto md:mt-36  min-h-screen mb-64 mr-16 sm:flex sm:flex-row justify-center  bg-transparent rounded-3xl  ">
      <div className="flex-col flex self-center lg:px-14 sm:max-w-4xl xl:max-w-md z-10">
        <div className="self-start hidden lg:flex flex-col text-gray-300">
          <h1 className="my-4  font-semibold text-4xl">Welcome to E-Commerce</h1>
          <p className="pr-3 text-sm opacity-75">
          Welcome to E-Commerce Project
          </p>
        </div>
      </div>
      <div className="flex mt-2 justify-center self-center z-10">
        <div className="p-12 bg-white mx-auto rounded-3xl w-96 ">
          <div className="flex items-center justify-center">
            <div className="  bg-blue-700	 rounded-full w-16 h-16 flex items-center justify-center">
            <img className="object-cover mb-2 object-center w-11 h-13 rounded"
            src="https://cdn.pixabay.com/photo/2016/04/01/11/25/avatar-1300331__340.png"/>
            </div>
          </div>
          <div className=" mt-4">
            <h3 className="font-semibold text-center text-2xl text-gray-800">Sign Up</h3>
       
          </div>
          <Formik
        initialValues={{ email: '', URL: '' }}
            validationSchema={SignupSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-6">
              <div className="mt-2">
                <label
                  htmlFor="email"
                  className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <Field
                  className="w-full text-sm px-4 py-3 bg-gray-200 focus:bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-600"
                  type="text"
                  name="email"
                  placeholder="Email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500"
                />
              </div>
                  <div>
                    <label
                      htmlFor="URL"
                      className="block mb-2 text-sm ml-2 font-medium text-gray-900 focus:outline-none focus:border-sky-600 dark:text-white"
                    >
                      URL
                    </label>
                    <Field
                      type="text"
                      name="URL"
                      id="URL"
                      placeholder="URL"
                      className="w-full text-sm px-4 py-3 bg-gray-200 focus:bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-600"
                    />
                    <ErrorMessage
                      name="URL"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div>

                  <p className="text-gray-400">
                  if you have an account?{" "}
                  <Link
                    href="/login"
                    className="text-sm text-blue-700 hover:text-purple-700"
                  >
                    Sign In
                  </Link>
                </p>
                  </div>
            

                  <button
                    className="w-full px-4 py-3 rounded-lg bg-blue-500 hover:bg-sky-500	  text-gray-100 font-semibold transition duration-300"
                    type="submit"
                  >
                    Sign Up
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <footer className="bg-transparent absolute w-full bottom-0 left-0 z-30">
        <div className="container p-5 mx-auto flex items-center justify-between">
          <div className="flex mr-auto">
            <p className="text-xl">
              <strong>E-Commerce</strong>
            </p>
          </div>
        </div>
      </footer>
      <div>
        <svg
          className="absolute bottom-0 left-0 "
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 260"
        >
          <path
            fill="rgb(238 242 255) "
            fill-opacity="1"
            d="M0,0L40,42.7C80,85,160,171,240,197.3C320,224,400,192,480,154.7C560,117,640,75,720,74.7C800,75,880,117,960,154.7C1040,192,1120,224,1200,213.3C1280,203,1360,149,1400,122.7L1440,96L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
    </>
  );
};

export default signup;