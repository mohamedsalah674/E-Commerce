import Link from "next/link";
import { toast } from "react-toastify";
import { useContext } from "react";
import { useRouter } from "next/router";
import { Context } from "../context";
import Cookies from "js-cookie";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import axios from "axios";

const Signin = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Context);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { data } = await axios.post("http://localhost:4001/api/users/signin", values);
      console.log("Data --> " , data);

      dispatch({
        type: "SIGNIN",
        payload: data,
      });

      Cookies.set("token", data.token);

  const role = data.user.role


      console.log("Role --> " , role);
      // Adjusted routing based on e-commerce roles
      switch (role) {
        case "User":
          router.push(`/user/dashboard/${data.user._id}`); // Assuming dashboard is where customers are redirected
          break;
        case "Admin":
          router.push(`/admin/dashboard/${data.user._id}`);
          break;
        // Add more roles as needed for your e-commerce platform
        default:
          router.push("/login");
          window.alert("Invalid credentials");
          break;
      }

      toast.success("Login success", {
        duration: 1000,
        position: "top-center",
        style: {
          background: "#2E7D32",
          color: "#fff",
          fontSize: "20px",
        },
      });
    } catch (error) {
      toast.error(error.response.data.errors[0].message, {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#D32F2F",
          color: "#fff",
          fontSize: "20px",
        },
      });
    }

    setSubmitting(false);
  };

  return (
    <div className="bg-white h-screen overflow-hidden flex items-center justify-center">
    <div className=" bg-sky-400 absolute bg-cover top-0 left-0 bg-gradient-to-b from-blue-900 via-blue-900 to-bg-blue-900 bottom-0 leading-5 h-full w-full overflow-hidden"></div>
    <div className="relative xl:lg:mt-4 sm:mt-36 max-sm:my-auto max-sm:mx-auto md:mt-36  min-h-screen mb-64 mr-16 sm:flex sm:flex-row justify-center  bg-transparent rounded-3xl  ">
      <div className="flex-col flex self-center lg:px-14 sm:max-w-4xl xl:max-w-md z-10">
        <div className="self-start hidden lg:flex flex-col text-gray-300">
          <h1 className="my-4  font-semibold text-4xl">Welcome to E-Commerce</h1>
          <p className="pr-3 text-sm opacity-75">
          Welcome to the E-Commerce project
          </p>
        </div>
      </div>

      <div className="flex mt-10 justify-center self-center z-10">
        <div className="p-12 bg-white mx-auto rounded-3xl w-96 ">
          <div className="flex items-center justify-center">
            <div className="  bg-blue-700	 rounded-full w-16 h-16 flex items-center justify-center">
            <img className="object-cover mb-2 object-center w-11 h-13 rounded"
            src="https://cdn.pixabay.com/photo/2016/04/01/11/25/avatar-1300331__340.png"/>
            </div>
          </div>
          <div className=" mt-4">
            <h3 className="font-semibold text-center text-2xl text-gray-800">Sign In</h3>
            <p className="text-gray-400">
              Dont have an account?{" "}
              <Link
                href="/signup"
                className="text-sm text-blue-700 hover:text-purple-700"
              >
                Sign Up
              </Link>
            </p>
          </div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
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

                <div className="relative">
                  <label
                    htmlFor="password"
                    className="block  text-base font-medium text-gray-900 dark:text-white"
                  >
                    Password
                  </label>
                  <Field
                    className="text-sm font-bold text-gray-900 px-4 py-3 rounded-lg w-full bg-gray-200 focus:bg-gray-100 border border-gray-200 focus:outline-none focus:border-sky-600"
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                  />
                  <div className="flex items-center absolute inset-y-0 right-0 mr-3 text-sm leading-5">
                    <svg
                      className="h-4 mt-4  text-blue-700"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 576 512"
                    >
                      <path
                        fill="currentColor"
                        d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.71 135.59 3.48 241.4A32.005 32.005 0 0 0 32 288v80c0 70.58 57.42 128 128 128h192c70.58 0 128-57.42 128-128v-80c0-17.67 14.33-32 32-32s32 14.33 32 32v80c0 68.38-19.19 129.53-52.48 181.83-41.65 61.27-100.63 104.1-167.52 125.03V512h64c35.35 0 64-28.65 64-64v-80c0-25.91-15.47-48.7-39.17-58.69-6.12-69.12-33.12-130.11-74.81-177.18zM288 96c106 0 192 86 192 192v48H96v-48c0-106 86-192 192-192zm-64 272h128v128H224zm64-352a96 96 0 1 1 0 192 96 96 0 0 1 0-192z"
                      />
                    </svg>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Field
                      id="remember"
                      type="checkbox"
                      name="remember"
                      className="w-4 h-4 border border-gray-300 rounded  focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="remember"
                      className="text-gray-700 dark:text-gray-600"
                    >
                      Remember me
                    </label>
                  </div>
                </div>
                <Link
                  href="/forgotpassword"
                  className="text-sm font-semibold text-blue-500 hover:underline dark:text-primary-500"
                >
                  Forgot password?
                </Link>
              </div>

                <button
                  className="w-full px-4 py-3 rounded-lg bg-blue-500 hover:bg-sky-500	  text-gray-100 font-semibold transition duration-300"
                  type="submit"
                >
                  Sign In
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
        viewBox="0 0 1440 240"
      >
        <path
          fill="rgb(238 242 255) "
          fillOpacity="1"
          d="M0,0L40,42.7C80,85,160,171,240,197.3C320,224,400,192,480,154.7C560,117,640,75,720,74.7C800,75,880,117,960,154.7C1040,192,1120,224,1200,213.3C1280,203,1360,149,1400,122.7L1440,96L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
        ></path>
      </svg>
    </div>
  </div>
);
};

export default Signin;
