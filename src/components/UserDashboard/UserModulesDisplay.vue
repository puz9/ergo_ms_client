<template>
  <div class="user-modules-display">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <Layers class="icon me-2" />
          Доступные модули
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
        
        <div v-else-if="modules.length > 0" class="modules-grid">
          <div 
            v-for="module in modules" 
            :key="module.id"
            class="module-card"
            @click="navigateToModule(module)"
          >
            <div class="module-icon">
              <component :is="getModuleIcon(module.code)" class="icon-lg" />
            </div>
            <div class="module-content">
              <h6 class="module-title">{{ module.name }}</h6>
              <p class="module-description">{{ module.description || 'Описание отсутствует' }}</p>
            </div>
            <div class="module-arrow">
              <ChevronRight class="icon" />
            </div>
          </div>
        </div>
        
        <div v-else class="text-center text-muted">
          <XCircle class="icon-lg mb-3" />
          <p>У вас нет доступа к модулям системы</p>
          <small>Обратитесь к администратору для получения доступа</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Layers, 
  XCircle, 
  ChevronRight,
  MessageSquare,
  BarChart3,
  Building2,
  GraduationCap,
  Brain,
  TrendingUp,
  Users,
  FileText,
  Database,
  MapPin,
  Tag,
  Mail,
  Video,
  Code
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import apiService from '@/js/apiService'

export default {
  name: 'UserModulesDisplay',
  components: {
    Layers,
    XCircle,
    ChevronRight,
    MessageSquare,
    BarChart3,
    Building2,
    GraduationCap,
    Brain,
    TrendingUp,
    Users,
    FileText,
    Database,
    MapPin,
    Tag,
    Mail,
    Video,
    Code
  },
  setup() {
    const router = useRouter()
    const toast = useToast()
    const modules = ref([])
    const loading = ref(true)

    const loadModules = async () => {
      try {
        const response = await apiService.get('/api/cms/system-modules/available/')
        modules.value = response.data
      } catch (error) {
        console.error('Ошибка загрузки модулей:', error)
        toast.error('Не удалось загрузить доступные модули')
      } finally {
        loading.value = false
      }
    }

    const getModuleIcon = (moduleCode) => {
      const iconMap = {
        'messenger': MessageSquare,
        'bi': BarChart3,
        'organizations': Building2,
        'lms': GraduationCap,
        'expert_system': Brain,
        'education_analytics': TrendingUp,
        'crm': Users,
        'cms': FileText,
        'porosity_analysis': Database,
        'assets_analysis': BarChart3,
        'city_analyze': MapPin,
        'categories': Tag,
        'email': Mail,
        'watermark_video': Video,
        'shortcodes': Code
      }
      
      return iconMap[moduleCode] || Layers
    }

    const navigateToModule = (module) => {
      // Определяем маршрут для модуля
      const routeMap = {
        'messenger': '/messenger',
        'bi': '/bi',
        'organizations': '/organizations',
        'lms': '/lms',
        'expert_system': '/expert-system',
        'education_analytics': '/education-analytics',
        'crm': '/crm',
        'cms': '/cms',
        'porosity_analysis': '/porosity-analysis',
        'assets_analysis': '/assets-analysis',
        'city_analyze': '/city-analyze',
        'categories': '/categories',
        'email': '/email',
        'watermark_video': '/watermark-video',
        'shortcodes': '/shortcodes'
      }
      
      const route = routeMap[module.code]
      if (route) {
        router.push(route)
      } else {
        toast.info(`Переход к модулю "${module.name}" пока не настроен`)
      }
    }

    onMounted(() => {
      loadModules()
    })

    return {
      modules,
      loading,
      getModuleIcon,
      navigateToModule
    }
  }
}
</script>

<style scoped>
.user-modules-display {
  margin-bottom: 20px;
}

.icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
}

.icon-lg {
  width: 32px;
  height: 32px;
  vertical-align: middle;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.module-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.module-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  transform: translateY(-2px);
}

.module-icon {
  margin-right: 16px;
  color: #007bff;
}

.module-content {
  flex: 1;
}

.module-title {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #212529;
}

.module-description {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.4;
}

.module-arrow {
  color: #6c757d;
  transition: color 0.2s ease;
}

.module-card:hover .module-arrow {
  color: #007bff;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.card-header h5 {
  color: #495057;
  font-weight: 600;
}

@media (max-width: 768px) {
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .module-card {
    padding: 16px;
  }
  
  .module-icon {
    margin-right: 12px;
  }
}
</style>

