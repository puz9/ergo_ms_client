import axios from 'axios'
import Cookies from 'js-cookie'

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const lsToken = localStorage.getItem('auth_token')
    const cookieToken = Cookies.get('token')
    const token = lsToken || cookieToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Логируем ошибку в консоль для отладки
    console.error('API Error:', error)
    
    // Возвращаем ошибку для обработки в компонентах
    return Promise.reject(error)
  }
)

// Методы для работы с ролями
const roleService = {
  // Получить все роли
  getRoles: () => api.get('/api/cms/user-roles/'),
  
  // Получить роль по ID
  getRole: (id) => api.get(`/api/cms/user-roles/${id}/`),
  
  // Создать новую роль
  createRole: (roleData) => api.post('/api/cms/user-roles/', roleData),
  
  // Обновить роль
  updateRole: (id, roleData) => api.put(`/api/cms/user-roles/${id}/`, roleData),
  
  // Удалить роль
  deleteRole: (id) => api.delete(`/api/cms/user-roles/${id}/`),
  
  // Получить системные роли
  getSystemRoles: () => api.get('/api/cms/user-roles/system_roles/'),
}

// Методы для работы с модулями
const moduleService = {
  // Получить все модули
  getModules: () => api.get('/api/cms/system-modules/'),
  
  // Получить модуль по ID
  getModule: (id) => api.get(`/api/cms/system-modules/${id}/`),
  
  // Получить дерево модулей
  getModulesTree: () => api.get('/api/cms/system-modules/tree/'),
  
  // Получить доступные модули для текущего пользователя
  getAvailableModules: () => api.get('/api/cms/system-modules/available/'),
  
  // Создать новый модуль
  createModule: (moduleData) => api.post('/api/cms/system-modules/', moduleData),
  
  // Обновить модуль
  updateModule: (id, moduleData) => api.put(`/api/cms/system-modules/${id}/`, moduleData),
  
  // Удалить модуль
  deleteModule: (id) => api.delete(`/api/cms/system-modules/${id}/`),
}

// Методы для работы с профилями пользователей
const profileService = {
  // Получить профиль текущего пользователя
  getCurrentUserProfile: () => api.get('/api/cms/user-profiles/current_user/'),
  
  // Получить профиль пользователя по ID
  getUserProfile: (id) => api.get(`/api/cms/user-profiles/${id}/`),
  
  // Обновить профиль пользователя
  updateUserProfile: (id, profileData) => api.put(`/api/cms/user-profiles/${id}/`, profileData),
  
  // Получить список пользователей с ролями
  getUsersWithRoles: () => api.get('/api/cms/user-profiles/users_with_roles/'),
}

// Основной сервис API
const apiService = {
  // Базовые HTTP методы
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
  
  // Специализированные сервисы
  roles: roleService,
  modules: moduleService,
  profiles: profileService,
  
  // Утилиты
  setAuthToken: (token) => {
    localStorage.setItem('auth_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },
  
  removeAuthToken: () => {
    localStorage.removeItem('auth_token')
    delete api.defaults.headers.common['Authorization']
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token')
  }
}

export default apiService

