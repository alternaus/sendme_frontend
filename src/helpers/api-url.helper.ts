const API_URL = import.meta.env.PROD?
  `${window.location.origin}/api`
  : "http://localhost:4000/api"

const BASE_URL = `${window.location.origin}`


export { API_URL, BASE_URL }
