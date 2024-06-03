/* eslint-disable no-console */
export default function ({ $axios, redirect }) {
  if (process.env.NODE_ENV === 'development') {
    // accept self signed certificates in axios
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  $axios.onRequest(config => {
    config.withCredentials = true

    return config
  });

  $axios.onResponse(response => {
    console.log(`[${response.status}] ${response.request.path}`);
  });

  $axios.onError(error => {
    console.log(`Error: ${error}`);
    // console.log(error.request);
    const code = parseInt(error.response && error.response.status)
    if (code === 400) {
      redirect('/400')
    }
  })

  $axios.onRequestError(error => {
    console.log(`Request Error: ${error}`);
    const code = parseInt(error.response && error.response.status)
    if (code === 400) {
      redirect('/400')
    }
  })

  $axios.onResponseError(error => {
    console.log(`Response Error: ${error}`);
    // console.log(error.request);
    const code = parseInt(error.response && error.response.status)
    if (code === 400) {
      redirect('/400')
    }
  })
}