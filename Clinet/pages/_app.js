import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Head from 'next/head';
import { useState, useEffect } from "react";
import Loader from "../components/loader/Loader";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { Provider } from '../context';
import buildClient from '../hooks/build';
import Router from 'next/router';
import catchAxiosError from '../utils/error';


export default function MyApp({ Component, pageProps, user }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url) => {
      console.log("Router is changing ... ");
      setLoading(true);
      NProgress.start();
    };

    const handleComplete = (url) => {
      console.log("Router change is complete ... ");
      setLoading(false);
      NProgress.done();
    };

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleComplete);

    return () => {
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleComplete);
    };
  }, []);

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/logo.jpg" />
        <title>E-Commerce</title>
      </Head>
      <Provider>
      <ToastContainer />
        {loading ? (
          <Loader />
        ) : (
          <>
            <main className="main">
           
              <Component {...pageProps} user={user} />
            </main>
            <Footer />
          </>
        )}
      </Provider>
    </>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx, 'http://localhost:4001');
  const { res, pathname, query } = appContext.ctx;

  try {
    const { data } = await client.get('api/users/currentuser').catch(catchAxiosError);
    console.log(data);

    let pageProps = {};
    if (appContext.Component.getInitialProps) {
      pageProps = await appContext.Component.getInitialProps(
        appContext.ctx,
        client,
        data?.currentUser
      );
    }

    let user;
    console.log(data);
    if (
      !data?.currentUser &&
      pathname !== '/login' &&
      pathname !== '/signup' &&
      pathname !== '/completesignup' &&
      pathname !== '/forgotpassword' &&
      !pathname.includes('/resetpassword') &&
      !pathname.includes('/survey')&&
      !pathname.includes('/orders')&&
      !pathname.includes('/acuationProducts')&&
      !pathname.includes('/dashboard')&&
      !pathname.includes('/products')&&
      !pathname.includes('/admindashboard')&&
      !pathname.includes('/user')&&
      !pathname.includes('/payments')&&
      !pathname.includes('/categories')&&


      pathname !== '/'
    ) {
      console.log(pathname, 'outside');
      if (res) {
        res.writeHead(302, { Location: '/' });
        res.end();
      } else {
        Router.push('/');
      }
    } else {
      if (data) {
        user = data.currentUser;
        if (
          user?.role == 'admin' &&
          !pathname.includes('/admin') &&
          pathname != '/' &&
          pathname != '/_error'
        ) {
          console.log(pathname, 'inside');

          if (res) {
            res.writeHead(302, { Location: '/admin' });
            res.end();
          } else {
            Router.push('/admin');
          }
        } else if (
          user?.role == 'instructor' &&
          !pathname.includes('/instructor') &&
          pathname != '/' &&
          pathname != '/_error'
        ) {
          console.log(pathname, 'inside');

          if (res) {
            res.writeHead(302, { Location: `/instructor/${data.currentUser.id}/dashboard` });
            res.end();
          } else {
            Router.push(`/instructor/${data.currentUser.id}/dashboard`);
          }
        } else if (
          user?.role == 'coordinator' &&
          !pathname.includes('/coordinator') &&
          pathname != '/' &&
          pathname != '/_error'
        ) {
          console.log(pathname, 'inside');

          if (res) {
            res.writeHead(302, { Location: `/coordinator/${data.currentUser.id}/dashboard` });
            res.end();
          } else {
            Router.push(`/coordinator/${data.currentUser.id}/dashboard`);
          }
        } else if (
          user?.role == 'head_of_department' &&
          !pathname.includes('/headofdepartment') &&
          pathname != '/' &&
          pathname != '/_error'
        ) {
          console.log(pathname, 'inside');

          if (res) {
            res.writeHead(302, { Location: `/headofdepartment/${data.currentUser.id}/dashbord` });
            res.end();
          } else {
            Router.push(`/headofdepartment/${data.currentUser.id}/dashbord`);
          }
        } else if (
          user?.role == 'dean' &&
          !pathname.includes(`/dean`) &&
          pathname != '/' &&
          pathname != '/_error'
        ) {
          console.log(pathname, 'inside');

          if (res) {
            res.writeHead(302, { Location: `/dean/dashboard` });
            res.end();
          } else {
            Router.push(`/dean/dashboard`);
          }
        }
      }
    }


    return {
      pageProps,
      user,
    };
  } catch (error) {
    console.error("Error in getInitialProps:", error);
    return {};
  }

};


