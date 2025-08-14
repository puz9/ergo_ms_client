<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import apiService from '@/js/apiService'

const toast = useToast()
const testResults = ref([])
const loading = ref(false)

const runTests = async () => {
  loading.value = true
  testResults.value = []
  
  try {
    // Тест 1: Получение модулей
    try {
      const modulesResponse = await apiService.get('/api/cms/system-modules/')
      testResults.value.push({
        test: 'Получение модулей системы',
        status: 'success',
        message: `Успешно получено ${modulesResponse.data.length} модулей`
      })
    } catch (error) {
      testResults.value.push({
        test: 'Получение модулей системы',
        status: 'error',
        message: `Ошибка: ${error.message}`
      })
    }

    // Тест 2: Получение ролей
    try {
      const rolesResponse = await apiService.get('/api/cms/user-roles/')
      testResults.value.push({
        test: 'Получение ролей пользователей',
        status: 'success',
        message: `Успешно получено ${rolesResponse.data.length} ролей`
      })
    } catch (error) {
      testResults.value.push({
        test: 'Получение ролей пользователей',
        status: 'error',
        message: `Ошибка: ${error.message}`
      })
    }

    // Тест 3: Получение профиля текущего пользователя
    try {
      const profileResponse = await apiService.get('/api/cms/user-profiles/current_user/')
      testResults.value.push({
        test: 'Получение профиля пользователя',
        status: 'success',
        message: `Профиль получен, роль: ${profileResponse.data.role_name || 'Не назначена'}`
      })
    } catch (error) {
      testResults.value.push({
        test: 'Получение профиля пользователя',
        status: 'error',
        message: `Ошибка: ${error.message}`
      })
    }

    // Тест 4: Получение доступных модулей
    try {
      const availableModulesResponse = await apiService.get('/api/cms/system-modules/available/')
      testResults.value.push({
        test: 'Получение доступных модулей',
        status: 'success',
        message: `Доступно ${availableModulesResponse.data.length} модулей`
      })
    } catch (error) {
      testResults.value.push({
        test: 'Получение доступных модулей',
        status: 'error',
        message: `Ошибка: ${error.message}`
      })
    }

  } catch (error) {
    testResults.value.push({
      test: 'Общий тест',
      status: 'error',
      message: `Критическая ошибка: ${error.message}`
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  runTests()
})
</script>

<template>
  <div class="test-roles-page">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-vial me-2"></i>
          Тестирование системы ролей
        </h5>
        <p class="text-muted mb-0 mt-2">
          Проверка работоспособности API для системы управления ролями и модулями
        </p>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <button 
            class="btn btn-primary" 
            @click="runTests"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Запустить тесты
          </button>
        </div>

        <div v-if="testResults.length > 0">
          <h6 class="mb-3">Результаты тестирования:</h6>
          <div class="list-group">
            <div 
              v-for="(result, index) in testResults" 
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-center"
              :class="{
                'list-group-item-success': result.status === 'success',
                'list-group-item-danger': result.status === 'error'
              }"
            >
              <div>
                <strong>{{ result.test }}</strong>
                <div class="text-muted small">{{ result.message }}</div>
              </div>
              <span 
                class="badge"
                :class="{
                  'bg-success': result.status === 'success',
                  'bg-danger': result.status === 'error'
                }"
              >
                {{ result.status === 'success' ? 'Успешно' : 'Ошибка' }}
              </span>
            </div>
          </div>
        </div>

        <div v-else-if="!loading" class="text-center text-muted">
          <p>Нажмите "Запустить тесты" для проверки системы</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.test-roles-page {
  .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }
  
  .card-header h5 {
    color: #495057;
    font-weight: 600;
  }
  
  .text-muted {
    font-size: 0.9rem;
  }
}
</style>
