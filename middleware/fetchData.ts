import { api } from "~/services/httpClient";

export const fetchUsers = () => api.get('/users').then(response => response.data)
