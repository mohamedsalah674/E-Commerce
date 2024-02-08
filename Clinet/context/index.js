import { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import buildClient from '../hooks/build';

const initialState = {
  user: null,
};






//create context

const Context = createContext();

//root Reducer

const rootReducer = (state, action) => {
  switch (action.type) {
    case 'SIGNUP':
      return { ...state, user: action.payload };
    case 'COMPLETE SIGNUP':
      return { ...state, user: action.payload };
    case 'SIGNIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'FORGOTPASSWORD':
      return { ...state, user: action.payload };
    case 'RESETPASSWORD':
      return { ...state, user: action.payload };

    default:
      return state;
  }
};
//create Provider
const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  useEffect(() => {
    dispatch({
      type: 'SIGNIN',
      payload: JSON.parse(window.localStorage.getItem('token')),
    });
  }, []);

  axios.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      let res = error.response;
      if (res && res.status === 401 && res.config && !res.config.__isRetryRequest) {
        return new Promise((resolve, reject) => {
          const client = buildClient('');
          console.log('/401 error > logout');
          client.get('api/users/signout')
            .then((data) => {
              dispatch({ type: 'LOGOUT' });
              Cookies.remove('token');
              router.push('/login');
            })
            .catch((err) => {
              console.log('Axios error', err);
              reject(error);
            });
        });
      }
      return Promise.reject(error);
    }
  );

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};

export { Context, Provider };
