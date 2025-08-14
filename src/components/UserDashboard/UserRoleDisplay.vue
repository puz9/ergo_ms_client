<template>
  <div class="user-role-display">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <User class="icon me-2" />
          Моя роль в системе
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
        
        <div v-else-if="userProfile" class="role-info">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label fw-bold">Роль:</label>
                <div class="role-name">
                  <span class="badge bg-primary fs-6">{{ userProfile.role_name }}</span>
                </div>
              </div>
              
              <div class="mb-3" v-if="userProfile.role?.description">
                <label class="form-label fw-bold">Описание роли:</label>
                <p class="text-muted mb-0">{{ userProfile.role.description }}</p>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label fw-bold">Доступные модули:</label>
                <div class="modules-list">
                  <span 
                    v-for="module in availableModules" 
                    :key="module.id"
                    class="badge bg-secondary me-1 mb-1"
                  >
                    {{ module.name }}
                  </span>
                  <span v-if="!availableModules.length" class="text-muted">
                    Нет доступных модулей
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <hr>
          
          <div class="row">
            <div class="col-md-6">
              <small class="text-muted">
                <Calendar class="icon-sm me-1" />
                Дата регистрации: {{ formatDate(userProfile.created_at) }}
              </small>
            </div>
            <div class="col-md-6">
              <small class="text-muted">
                <Clock class="icon-sm me-1" />
                Последнее обновление: {{ formatDate(userProfile.updated_at) }}
              </small>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center text-muted">
          <UserX class="icon-lg mb-3" />
          <p>Информация о роли не найдена</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { User, Calendar, Clock, UserX } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import apiService from '@/js/apiService'

export default {
  name: 'UserRoleDisplay',
  components: {
    User,
    Calendar,
    Clock,
    UserX
  },
  setup() {
    const toast = useToast()
    const userProfile = ref(null)
    const availableModules = ref([])
    const loading = ref(true)

    const loadUserProfile = async () => {
      try {
        const response = await apiService.get('/api/cms/user-profiles/current_user/')
        userProfile.value = response.data
        
        // Загружаем доступные модули для роли пользователя
        if (userProfile.value.role) {
          const modulesResponse = await apiService.get('/api/cms/system-modules/available/')
          availableModules.value = modulesResponse.data
        }
      } catch (error) {
        console.error('Ошибка загрузки профиля пользователя:', error)
        toast.error('Не удалось загрузить информацию о роли')
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      loadUserProfile()
    })

    return {
      userProfile,
      availableModules,
      loading,
      formatDate
    }
  }
}
</script>

<style scoped>
.user-role-display {
  margin-bottom: 20px;
}

.icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
}

.icon-sm {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

.icon-lg {
  width: 48px;
  height: 48px;
  vertical-align: middle;
}

.role-name {
  margin-top: 5px;
}

.role-name .badge {
  font-size: 1rem;
  padding: 8px 16px;
}

.modules-list {
  margin-top: 5px;
}

.modules-list .badge {
  font-size: 0.875rem;
  padding: 6px 12px;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.card-header h5 {
  color: #495057;
  font-weight: 600;
}
</style>

