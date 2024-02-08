import Router from 'next/router'

const catchAxiosError = (err) => {
  // Something happened in setting up the request that triggered an Error
  let message =
    'Something happened in setting up the request that triggered an Error'

  if (err.response) {
    message = err.response.data?.error?.message || err.response.data
  } else if (err.request) {
    message = 'The request was made, but no response was received'
  }

  return { error: message }
}

export default catchAxiosError
