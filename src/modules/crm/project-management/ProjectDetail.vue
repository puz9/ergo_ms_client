<template>
  <div class="project-detail-page">
    <!-- Заголовок страницы -->
    <div class="page-header">
      <div class="header-content">
        <nav aria-label="breadcrumb" class="breadcrumb-nav">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/crm/project-management" class="breadcrumb-link">
                <Home :size="16" />
                <span>Управление проектами</span>
              </router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="getBackRoute()" class="breadcrumb-link">
                {{ getBackRouteTitle() }}
              </router-link>
            </li>
            <li class="breadcrumb-item active">
              {{ project?.name || 'Загрузка...' }}
            </li>
          </ol>
        </nav>
        
        <div class="project-title-section">
          <div class="project-icon" v-if="project" :style="{ backgroundColor: project.color }">
            <ListTodo :size="24" color="white" />
          </div>
          <div class="project-title">
            <h1>{{ project?.name || 'Загрузка проекта...' }}</h1>
            <div class="project-meta-badges" v-if="project">
              <span class="badge status-badge" :class="getStatusClass(project.status)">
                {{ getStatusText(project.status) }}
              </span>
              <span class="badge priority-badge" :class="getPriorityClass(project.priority)">
                {{ getPriorityText(project.priority) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="header-actions" v-if="project">
        <button class="btn btn-outline-primary" @click="editProject" title="Редактировать проект">
          <Edit :size="16" />
          <span>Редактировать</span>
        </button>
        <button class="btn btn-primary" @click="createTask" title="Добавить задачу">
          <Plus :size="16" />
          <span>Добавить задачу</span>
        </button>
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-state">
      <div class="d-flex flex-column align-items-center justify-content-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="text-muted">Загружаем данные проекта...</p>
      </div>
    </div>

    <!-- Состояние ошибки -->
    <div v-else-if="error" class="error-state">
      <AlertTriangle :size="48" class="error-icon" />
      <h3>Ошибка загрузки</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadProject">Попробовать снова</button>
    </div>

    <!-- Основной контент -->
    <div v-else-if="project" class="project-content">
      <!-- Информационная секция -->
      <div class="info-section">
        <div class="info-grid">
          <!-- Основная информация о проекте -->
          <div class="info-card main-info">
            <div class="card-header">
              <Info :size="20" />
              <h3>Информация о проекте</h3>
            </div>
            <div class="card-body">
              <div class="description-section">
                <p class="description">{{ project.description || 'Описание отсутствует' }}</p>
              </div>
              
              <div class="meta-grid">
                <div class="meta-item">
                  <div class="meta-icon">
                    <Calendar :size="16" />
                  </div>
                  <div class="meta-content">
                    <span class="meta-label">Дата начала</span>
                    <span class="meta-value">{{ formatDate(project.start_date) || 'Не указана' }}</span>
                  </div>
                </div>
                
                <div class="meta-item">
                  <div class="meta-icon">
                    <Clock :size="16" />
                  </div>
                  <div class="meta-content">
                    <span class="meta-label">Дата окончания</span>
                    <span class="meta-value">{{ formatDate(project.end_date) || 'Не указана' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Дополнительные поля -->
              <div class="string-fields-section" v-if="project.string_fields && project.string_fields.length > 0">
                <div class="section-title">
                  <List :size="16" />
                  <span>Дополнительные поля</span>
                </div>
                <div class="string-fields-list">
                  <div v-for="(field, index) in project.string_fields" :key="field.id" class="string-field-item">
                    <div class="string-field-content">
                      <span class="field-number">{{ index + 1 }}.</span>
                      <span class="field-value">{{ field.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Статистика проекта -->
          <div class="info-card stats-card">
            <div class="card-header">
              <PieChart :size="20" />
              <h3>Статистика</h3>
            </div>
            <div class="card-body">
              <!-- Прогресс -->
              <div class="progress-section">
                <div class="progress-header">
                  <span>Общий прогресс</span>
                  <span class="progress-value">{{ project.progress || 0 }}%</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar" 
                       :style="{ width: (project.progress || 0) + '%' }"
                       :class="getProgressClass(project.progress || 0)">
                  </div>
                </div>
              </div>
              
              <!-- Статистика задач -->
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon">
                    <ListTodo :size="20" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ project.task_count || 0 }}</div>
                    <div class="stat-label">Всего задач</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon completed">
                    <CheckCircle :size="20" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ project.completed_task_count || 0 }}</div>
                    <div class="stat-label">Выполнено</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon in-progress">
                    <Clock :size="20" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ (project.task_count || 0) - (project.completed_task_count || 0) }}</div>
                    <div class="stat-label">В работе</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Команда проекта -->
          <div class="info-card team-card" v-if="project">
            <div class="card-header">
              <Users :size="20" />
              <h3>Команда проекта</h3>
              <button class="btn btn-outline-primary btn-sm" @click="openTeamModal" title="Управление командой">
                <UserPlus :size="16" />
                <span>Добавить участника</span>
              </button>
            </div>
            <div class="card-body">

              
              <div class="team-members">
                <!-- Все участники команды проекта -->
                <div class="team-member" 
                     v-for="member in allProjectMembers" 
                     :key="`team-member-${member.type}-${member.id}`">
                  <img :src="getAvatarUrl(member.user)" 
                       :alt="getUserDisplayName(member.user)"
                       class="member-avatar">
                  <div class="member-info">
                    <div class="member-name">{{ getUserDisplayName(member.user) }}</div>
                    <div class="member-role" :class="member.roleClass">
                      {{ member.roleText }}
                      <span v-if="member.badges.length > 0" class="member-badges ms-2">
                        <span v-for="badge in member.badges" 
                              :key="badge.text" 
                              :class="badge.class"
                              class="badge me-1">
                          {{ badge.text }}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div class="member-actions">
                    <button class="btn btn-delete-icon" 
                            v-if="member.canRemove"
                            @click="removeMember(member.originalMember)" 
                            title="Исключить из команды">
                      <UserMinus :size="14" />
                    </button>
                    <span v-else class="text-muted small" title="Нельзя исключить">
                      <i class="fas fa-lock"></i>
                    </span>
                  </div>
                </div>
                
                <!-- Пустое состояние -->
                <div v-if="allProjectMembers.length === 0" 
                     class="empty-team">
                  <Users :size="32" class="empty-icon" />
                  <p>В команде проекта пока нет участников</p>
                  <button class="btn btn-primary btn-sm" @click="openTeamModal">
                    <UserPlus :size="16" />
                    <span>Добавить первого участника</span>
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <!-- Секция задач -->
      <div class="tasks-section">
        <div class="section-header">
          <div class="section-title">
            <ListTodo :size="24" />
            <h2>Задачи проекта</h2>
          </div>
          <button class="btn btn-primary" @click="createTask">
            <Plus :size="16" />
            <span>Добавить задачу</span>
          </button>
        </div>
        
        <div class="tasks-content">
          <!-- Пустое состояние -->
          <div v-if="tasks.length === 0" class="empty-state">
            <ListTodo :size="64" class="empty-icon" />
            <h3>В проекте пока нет задач</h3>
            <p>Создайте первую задачу для начала работы</p>
            <button class="btn btn-primary btn-lg" @click="createTask">
              <Plus :size="20" />
              <span>Создать первую задачу</span>
            </button>
          </div>
          
          <!-- Таблица задач -->
          <div v-else class="tasks-table-container">
            <div class="table-responsive">
              <table class="tasks-table">
                <thead>
                  <tr>
                    <th>Задача</th>
                    <th>Исполнитель</th>
                    <th>Статус</th>
                    <th>Приоритет</th>
                    <th>Срок</th>
                    <th>Файлы</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="task in tasks" :key="task.id" class="task-row">
                    <td class="task-cell">
                      <div class="task-info">
                        <h4 class="task-title">{{ task.title }}</h4>
                        <p class="task-description" v-if="task.description">
                          {{ truncateText(task.description, 100) }}
                        </p>
                      </div>
                    </td>
                    <td class="assignee-cell">
                      <div class="assignee-info" v-if="task.assignee">
                        <img :src="getAvatarUrl(task.assignee)" 
                             :alt="getUserDisplayName(task.assignee)"
                             class="assignee-avatar">
                        <span class="assignee-name">{{ getUserDisplayName(task.assignee) }}</span>
                      </div>
                      <span v-else class="no-assignee">Не назначен</span>
                    </td>
                    <td class="status-cell">
                      <span class="badge status-badge" :class="getTaskStatusClass(task.status)">
                        {{ getTaskStatusText(task.status) }}
                      </span>
                    </td>
                    <td class="priority-cell">
                      <span class="badge priority-badge" :class="getPriorityClass(task.priority)">
                        {{ getPriorityText(task.priority) }}
                      </span>
                    </td>
                    <td class="due-date-cell">
                      <span :class="getDueDateClass(task.due_date, task.status)">
                        <Clock :size="14" />
                        {{ formatDate(task.due_date) || '-' }}
                      </span>
                    </td>
                    <td class="attachments-cell">
                      <div v-if="task.attachment_count > 0" class="attachments-info">
                        <i class="fas fa-paperclip text-primary me-1"></i>
                        <span class="attachment-count">{{ task.attachment_count }}</span>
                      </div>
                      <span v-else class="text-muted">
                        <i class="fas fa-paperclip"></i>
                      </span>
                    </td>
                    <td class="actions-cell">
                      <div class="action-buttons">
                        <button class="btn btn-view-icon" @click="viewTask(task)" title="Просмотреть">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-edit-icon" @click="editTask(task)" title="Редактировать">
                          <Edit :size="14" />
                        </button>
                        <button class="btn btn-delete-icon" @click="deleteTask(task)" title="Удалить">
                          <Trash2 :size="14" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Секция файлов проекта -->
      <div class="project-files-section" v-if="project && project.attachments && project.attachments.length > 0">
        <div class="section-header">
          <div class="section-title">
            <Paperclip class="me-3" :size="24" />
            <h2>Файлы проекта</h2>
          </div>
        </div>
        
        <div class="files-content">
          <div class="files-grid">
            <div v-for="file in project.attachments" :key="file.id" class="file-card">
              <div class="file-icon">
                <FileText class="text-primary" :size="32" />
              </div>
              <div class="file-info">
                <h6 class="file-name">
                  <a :href="file.file" target="_blank" class="text-decoration-none">
                    {{ file.filename }}
                  </a>
                </h6>
                <small class="text-muted">
                  Загружен {{ formatDateTime(file.uploaded_at) }}
                  <span v-if="file.uploaded_by"> пользователем {{ getUserDisplayName(file.uploaded_by) }}</span>
                </small>
              </div>
              <div class="file-actions">
                <button class="btn btn-sm btn-outline-primary" @click="downloadFile(file)" title="Скачать">
                  <Download :size="14" />
                </button>
                <button class="btn btn-sm btn-outline-info" @click="viewFile(file)" title="Просмотреть">
                  <Eye :size="14" />
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteProjectFile(file)" title="Удалить">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальные окна остаются без изменений -->
    <!-- Модальное окно редактирования проекта -->
    <div class="modal fade" id="projectModal" tabindex="-1" aria-labelledby="projectModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header border-bottom">
            <h5 class="modal-title" id="projectModalLabel">
              <Edit class="me-2" :size="20" />
              {{ isEditingProject ? 'Редактировать проект' : 'Создать проект' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitProject">
              <div class="mb-3">
                <label class="form-label">Название проекта *</label>
                <input type="text" class="form-control" v-model="currentProject.name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea class="form-control" rows="3" v-model="currentProject.description"></textarea>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Дата начала</label>
                    <input type="date" class="form-control" v-model="currentProject.start_date">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Дата окончания</label>
                    <input type="date" class="form-control" v-model="currentProject.end_date">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Статус</label>
                    <select class="form-select" v-model="currentProject.status" :disabled="loadingStatuses">
                      <option v-if="loadingStatuses">Загрузка...</option>
                      <option v-else v-for="status in projectStatuses" :key="status.id" :value="status.code">
                        {{ status.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Приоритет</label>
                    <select class="form-select" v-model="currentProject.priority" :disabled="loadingStatuses">
                      <option v-if="loadingStatuses">Загрузка...</option>
                      <option v-else v-for="priority in projectPriorities" :key="priority.id" :value="priority.code">
                        {{ priority.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Цвет проекта</label>
                <input type="color" class="form-control form-control-color" v-model="currentProject.color">
              </div>
              
              <!-- Существующие файлы (только при редактировании) -->
              <div v-if="isEditingProject && currentProject.attachments && currentProject.attachments.length > 0" class="mb-4">
                <label class="form-label fw-bold">
                  <Paperclip class="me-2" :size="16" />
                  Текущие вложения
                </label>
                <div class="list-group">
                  <div v-for="file in currentProject.attachments" :key="file.id" class="list-group-item d-flex align-items-center">
                    <FileText class="text-primary me-2" :size="16" />
                    <a :href="file.file" target="_blank" class="flex-grow-1 text-decoration-none">
                      {{ file.filename }}
                    </a>
                    <small class="text-muted me-2">({{ formatDateTime(file.uploaded_at) }})</small>
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeExistingProjectFile(file.id)">
                      <X :size="14" />
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Загрузка новых файлов -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <Paperclip class="me-2" :size="16" />
                  {{ isEditingProject ? 'Добавить файлы' : 'Вложения' }}
                </label>
                <div class="file-upload-area" 
                     @drop="onProjectFileDrop" 
                     @dragover.prevent 
                     @dragenter="onProjectDragEnter"
                     @dragleave="onProjectDragLeave"
                     :class="{ 'drag-over': isProjectDragOver }">
                  <div class="file-upload-content text-center p-4">
                    <Upload class="text-muted mb-3" :size="32" />
                    <p class="text-muted mb-2">Перетащите файлы сюда или</p>
                    <input type="file" 
                           ref="projectFileInput" 
                           @change="onProjectFileSelect" 
                           multiple 
                           class="d-none">
                    <button type="button" class="btn btn-outline-primary" @click="$refs.projectFileInput.click()">
                      <FolderOpen class="me-2" :size="16" />
                      Выбрать файлы
                    </button>
                  </div>
                </div>
                
                <!-- Список выбранных файлов -->
                <div v-if="selectedProjectFiles.length > 0" class="selected-files mt-3">
                  <h6 class="text-muted mb-2">Новые файлы:</h6>
                  <div class="list-group">
                    <div v-for="(file, index) in selectedProjectFiles" :key="index" class="list-group-item d-flex align-items-center">
                      <FileText class="text-primary me-2" :size="16" />
                      <span class="flex-grow-1">{{ file.name }}</span>
                      <small class="text-muted me-2">({{ formatFileSize(file.size) }})</small>
                      <button type="button" class="btn btn-sm btn-outline-danger" @click="removeProjectFile(index)">
                        <X :size="14" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Строковые поля -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <List class="me-2" :size="16" />
                  Дополнительные поля
                </label>
                <div class="string-fields-container">
                  <div v-for="(field, index) in currentProject.string_fields" :key="field.id" class="string-field-item mb-2">
                    <div class="input-group">
                      <input type="text" 
                             class="form-control" 
                             v-model="field.value" 
                             :placeholder="`Поле ${index + 1}`"
                             @blur="updateStringField(field)">
                      <button type="button" 
                              class="btn btn-outline-danger" 
                              @click="removeStringField(field.id, index)"
                              title="Удалить поле">
                        <X :size="14" />
                      </button>
                    </div>
                  </div>
                  
                  <button type="button" 
                          class="btn btn-outline-primary btn-sm" 
                          @click="addStringField"
                          title="Добавить поле">
                    <Plus class="me-1" :size="14" />
                    Добавить поле
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отменить</button>
            <button type="button" class="btn btn-primary" @click="submitProject" :disabled="!currentProject.name">
              <Save class="me-2" :size="16" />
              {{ isEditingProject ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования задачи -->
    <div class="modal fade" id="taskModal" tabindex="-1" aria-labelledby="taskModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content border-0">
          <div class="modal-header border-bottom">
            <h5 class="modal-title" id="taskModalLabel">
              <i class="fas fa-tasks me-2"></i>
              {{ isEditingTask ? 'Редактировать задачу' : 'Создать задачу' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="submitTask">
              <div class="row g-3 mb-4">
                <div class="col-md-8">
                  <label class="form-label fw-bold">Название задачи <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="currentTask.title" required
                         placeholder="Введите название задачи">
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Исполнитель</label>
                  <select class="form-select" v-model="currentTask.assignee_id">
                    <option value="">Не назначен</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                      {{ getUserDisplayName(user) }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="mb-4">
                <label class="form-label fw-bold">Описание</label>
                <textarea class="form-control" rows="3" v-model="currentTask.description"
                          placeholder="Опишите задачу подробнее"></textarea>
              </div>
              
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Статус</label>
                  <select class="form-select" v-model="currentTask.status" :disabled="loadingStatuses">
                    <option v-if="loadingStatuses">Загрузка...</option>
                    <option v-else v-for="status in taskStatuses" :key="status.id" :value="status.code">
                      {{ status.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Приоритет</label>
                  <select class="form-select" v-model="currentTask.priority" :disabled="loadingStatuses">
                    <option v-if="loadingStatuses">Загрузка...</option>
                    <option v-else v-for="priority in taskPriorities" :key="priority.id" :value="priority.code">
                      {{ priority.name }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="row g-3 mb-4">
                <div class="col-md-4">
                  <label class="form-label fw-bold">Дата начала</label>
                  <input type="datetime-local" class="form-control" v-model="currentTask.start_date">
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Срок выполнения</label>
                  <input type="datetime-local" class="form-control" v-model="currentTask.due_date">
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold">Оценка времени (часы)</label>
                  <input type="number" class="form-control" step="0.5" v-model="currentTask.estimated_hours"
                         placeholder="Сколько часов потребуется">
                </div>
              </div>
              
              <!-- Существующие файлы (только при редактировании) -->
              <div v-if="isEditingTask && currentTask.attachments && currentTask.attachments.length > 0" class="mb-4">
                <label class="form-label fw-bold">
                  <i class="fas fa-paperclip me-2"></i>Текущие вложения
                </label>
                <div class="list-group">
                  <div v-for="file in currentTask.attachments" :key="file.id" class="list-group-item d-flex align-items-center">
                    <i class="fas fa-file-alt text-primary me-2"></i>
                    <a :href="file.file" target="_blank" class="flex-grow-1 text-decoration-none">
                      {{ file.filename }}
                    </a>
                    <small class="text-muted me-2">({{ formatDateTime(file.uploaded_at) }})</small>
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeExistingFile(file.id)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Загрузка новых файлов -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <i class="fas fa-paperclip me-2"></i>{{ isEditingTask ? 'Добавить файлы' : 'Вложения' }}
                </label>
                <div class="file-upload-area" 
                     @drop="onFileDrop" 
                     @dragover.prevent 
                     @dragenter="onDragEnter"
                     @dragleave="onDragLeave"
                     :class="{ 'drag-over': isDragOver }">
                  <div class="file-upload-content text-center p-4">
                    <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-3"></i>
                    <p class="text-muted mb-2">Перетащите файлы сюда или</p>
                    <input type="file" 
                           ref="fileInput" 
                           @change="onFileSelect" 
                           multiple 
                           class="d-none">
                    <button type="button" class="btn btn-outline-primary" @click="$refs.fileInput.click()">
                      <i class="fas fa-folder-open me-2"></i>Выбрать файлы
                    </button>
                  </div>
                </div>
                
                <!-- Список выбранных файлов -->
                <div v-if="selectedFiles.length > 0" class="selected-files mt-3">
                  <h6 class="text-muted mb-2">Новые файлы:</h6>
                  <div class="list-group">
                    <div v-for="(file, index) in selectedFiles" :key="index" class="list-group-item d-flex align-items-center">
                      <i class="fas fa-file-alt text-primary me-2"></i>
                      <span class="flex-grow-1">{{ file.name }}</span>
                      <small class="text-muted me-2">({{ formatFileSize(file.size) }})</small>
                      <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFile(index)">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Дополнительные поля -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <List class="me-2" :size="16" />
                  Дополнительные поля
                </label>
                <div class="string-fields-container">
                  <div v-for="(field, index) in currentTask.string_fields" :key="field.id" class="string-field-item mb-2">
                    <div class="input-group">
                      <input type="text"
                             class="form-control"
                             v-model="field.value"
                             :placeholder="`Поле ${index + 1}`"
                             @blur="updateTaskStringField(field)">
                      <button type="button"
                              class="btn btn-outline-danger"
                              @click="removeTaskStringField(field.id, index)"
                              title="Удалить поле">
                        <X :size="14" />
                      </button>
                    </div>
                  </div>

                  <button type="button"
                          class="btn btn-outline-primary btn-sm"
                          @click="addTaskStringField"
                          title="Добавить поле">
                    <Plus class="me-1" :size="14" />
                    Добавить поле
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer border-top">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Отменить</button>
            <button type="button" class="btn btn-primary" @click="submitTask" 
                    :disabled="!currentTask.title">
              <i class="fas fa-save me-2"></i>{{ isEditingTask ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно управления командой -->
    <div class="modal fade" id="teamModal" tabindex="-1" aria-labelledby="teamModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="teamModalLabel">Управление командой проекта</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Добавить участника</h6>
                <div class="add-member-form">
                  <div class="mb-3">
                    <label class="form-label">Выберите пользователя</label>
                    <select class="form-select" v-model="selectedUserId">
                      <option value="">Выберите пользователя</option>
                      <option v-for="user in availableUsers" 
                              :key="user.id" 
                              :value="user.id">
                        {{ getUserDisplayName(user) }}
                      </option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Роль в проекте</label>
                    <select class="form-select" v-model="selectedRole">
                      <option value="">Выберите роль</option>
                      <option v-for="role in projectRoles" :key="role.id" :value="role.id">
                        {{ role.name }}
                      </option>
                    </select>
                  </div>
                  <button class="btn btn-primary" 
                          @click="addMember" 
                          :disabled="!selectedUserId || loadingTeamAction">
                    <i v-if="loadingTeamAction" class="fas fa-spinner fa-spin me-2"></i>
                    Добавить в команду
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <h6 class="mb-2">Текущая команда</h6>
                <div class="current-team">
                  
                  <!-- Владелец -->
                  <div class="team-member-modal" v-if="project && project.owner">
                    <img :src="getAvatarUrl(project.owner)" 
                         :alt="getUserDisplayName(project.owner)"
                         class="member-avatar-small">
                    <div class="member-info-modal">
                      <div class="member-name">{{ getUserDisplayName(project.owner) }}</div>
                      <div class="member-role owner-role">Владелец</div>
                    </div>
                  </div>
                  
                  <!-- Менеджер -->
                  <div class="team-member-modal" v-if="project && project.manager && project.manager.id !== project.owner?.id">
                    <img :src="getAvatarUrl(project.manager)" 
                         :alt="getUserDisplayName(project.manager)"
                         class="member-avatar-small">
                    <div class="member-info-modal">
                      <div class="member-name">{{ getUserDisplayName(project.manager) }}</div>
                      <div class="member-role manager-role">Менеджер проекта</div>
                    </div>
                  </div>
                  
                  <!-- Участники -->
                  <template v-for="member in filteredTeamMembers" :key="member.id">
                    <div class="team-member-modal" v-if="member && member.user">
                      <img :src="getAvatarUrl(member.user)" 
                           :alt="getUserDisplayName(member.user)"
                           class="member-avatar-small">
                      <div class="member-info-modal">
                        <div class="member-name">{{ getUserDisplayName(member.user) }}</div>
                        <div class="member-role" :class="getRoleClass(member.role)">{{ getRoleText(member.role) }}</div>
                      </div>
                      <button class="btn btn-delete-icon" @click="removeMember(member)" title="Исключить">
                        <UserMinus :size="12" />
                      </button>
                    </div>
                  </template>
                  
                  <div v-if="project && filteredTeamMembers.length === 0 && !project.owner && !project.manager" 
                       class="text-muted text-center">
                    <small>Пока нет участников</small>
                  </div>

                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно просмотра задачи -->
    <div class="modal fade" id="taskViewModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content border-0">
          <div class="modal-header bg-light border-bottom">
            <div class="d-flex align-items-center gap-3 w-100">
              <div class="icon-wrapper bg-primary bg-opacity-10 p-2 rounded-circle flex-shrink-0">
                <i class="fas fa-clipboard-check fa-lg text-primary"></i>
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <h5 class="modal-title mb-0 text-truncate" :title="selectedTask.title">{{ selectedTask.title }}</h5>
              </div>
            </div>
            <button type="button" class="btn-close flex-shrink-0 ms-3" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
            <div class="task-view-content">
              <!-- Статус и приоритет -->
              <div class="mb-4 d-flex gap-3">
                <span class="badge rounded-pill px-3 py-2" :class="getTaskStatusClass(selectedTask.status)">
                  <i class="fas fa-circle me-1" style="font-size: 0.5rem;"></i>
                  {{ getTaskStatusText(selectedTask.status) }}
                </span>
                <span class="badge rounded-pill px-3 py-2" :class="getPriorityClass(selectedTask.priority)">
                  <i class="fas fa-flag me-1"></i>
                  {{ getPriorityText(selectedTask.priority) }}
                </span>
              </div>

              <!-- Описание -->
              <div class="description-section mb-4 p-3 bg-light rounded" v-if="selectedTask.description">
                <h6 class="text-uppercase text-muted small mb-2">
                  <i class="fas fa-align-left me-2"></i>Описание
                </h6>
                <p class="mb-0 text-dark">{{ selectedTask.description }}</p>
              </div>

              <!-- Вложения -->
              <div class="attachments-section mb-4 p-3 bg-light rounded" v-if="selectedTask.attachments && selectedTask.attachments.length">
                <h6 class="text-uppercase text-muted small mb-2">
                  <i class="fas fa-paperclip me-2"></i>Вложения
                </h6>
                <ul class="list-unstyled mb-0">
                  <li v-for="file in selectedTask.attachments" :key="file.id" class="d-flex align-items-center mb-2">
                    <a :href="file.file" target="_blank" class="me-2 text-primary text-decoration-underline">
                      <i class="fas fa-file-alt me-1"></i>{{ file.filename }}
                    </a>
                    <span class="text-muted small me-2">({{ formatDateTime(file.uploaded_at) }})</span>
                    <button class="btn btn-sm btn-outline-danger ms-auto" @click="deleteAttachment(file)" title="Удалить файл">
                      <Trash2 :size="16" />
                    </button>
                  </li>
                </ul>
              </div>

              <!-- Дополнительные поля -->
              <div class="string-fields-section mb-4 p-3 bg-light rounded" v-if="selectedTask.string_fields && selectedTask.string_fields.length > 0">
                <h6 class="text-uppercase text-muted small mb-2">
                  <List class="me-2" :size="16" />
                  Дополнительные поля
                </h6>
                <div class="string-fields-list">
                  <div v-for="(field, index) in selectedTask.string_fields" :key="field.id" class="string-field-item">
                    <div class="string-field-content">
                      <span class="field-number">{{ index + 1 }}.</span>
                      <span class="field-value">{{ field.value }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Основная информация в карточках -->
              <div class="row g-3 mb-4">
                <!-- Исполнитель -->
                <div class="col-md-6">
                  <div class="info-card h-100 p-3 border rounded">
                    <div class="d-flex align-items-center mb-2">
                      <div class="icon-sm bg-success bg-opacity-10 p-2 rounded me-2">
                        <i class="fas fa-user text-success"></i>
                      </div>
                      <h6 class="mb-0 text-muted small">
                        <i class="fas fa-user-check me-1"></i>ИСПОЛНИТЕЛЬ
                      </h6>
                    </div>
                    <div class="d-flex align-items-center" v-if="selectedTask.assignee">
                      <img :src="getAvatarUrl(selectedTask.assignee)" 
                           :alt="getUserDisplayName(selectedTask.assignee)"
                           class="rounded-circle me-2"
                           style="width: 32px; height: 32px; object-fit: cover;">
                      <div class="fw-bold text-dark">
                        {{ getUserDisplayName(selectedTask.assignee) }}
                      </div>
                    </div>
                    <div v-else class="fw-bold text-muted">
                      <i class="fas fa-user-slash me-2"></i>Не назначен
                    </div>
                  </div>
                </div>

                <!-- Создатель -->
                <div class="col-md-6" v-if="selectedTask.creator">
                  <div class="info-card h-100 p-3 border rounded">
                    <div class="d-flex align-items-center mb-2">
                      <div class="icon-sm bg-info bg-opacity-10 p-2 rounded me-2">
                        <i class="fas fa-user-plus text-info"></i>
                      </div>
                      <h6 class="mb-0 text-muted small">
                        <i class="fas fa-user-plus me-1"></i>СОЗДАТЕЛЬ
                      </h6>
                    </div>
                    <div class="d-flex align-items-center">
                      <img :src="getAvatarUrl(selectedTask.creator)" 
                           :alt="getUserDisplayName(selectedTask.creator)"
                           class="rounded-circle me-2"
                           style="width: 32px; height: 32px; object-fit: cover;">
                      <div class="fw-bold text-dark">
                        {{ getUserDisplayName(selectedTask.creator) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Даты и время -->
              <div class="row g-3 mb-4">
                <!-- Сроки -->
                <div class="col-md-6">
                  <div class="info-card h-100 p-3 border rounded">
                    <div class="d-flex align-items-center mb-2">
                      <div class="icon-sm bg-warning bg-opacity-10 p-2 rounded me-2">
                        <i class="fas fa-calendar-alt text-warning"></i>
                      </div>
                      <h6 class="mb-0 text-muted small">
                        <i class="fas fa-calendar-check me-1"></i>СРОКИ
                      </h6>
                    </div>
                    <div v-if="selectedTask.due_date">
                      <div class="mb-1">
                        <small class="text-muted">
                          <i class="fas fa-hourglass-end me-1"></i>Срок выполнения:
                        </small>
                      </div>
                      <div class="fw-bold" :class="getDueDateClass(selectedTask.due_date, selectedTask.status)">
                        <i class="fas fa-calendar-day me-1"></i>
                        {{ formatDateTime(selectedTask.due_date) }}
                      </div>
                    </div>
                    <div v-else class="fw-bold text-muted">
                      <i class="fas fa-calendar-times me-2"></i>Срок не установлен
                    </div>
                  </div>
                </div>

                <!-- Время -->
                <div class="col-md-6" v-if="selectedTask.estimated_hours || selectedTask.actual_hours">
                  <div class="info-card h-100 p-3 border rounded">
                    <div class="d-flex align-items-center mb-2">
                      <div class="icon-sm bg-info bg-opacity-10 p-2 rounded me-2">
                        <i class="fas fa-clock text-info"></i>
                      </div>
                      <h6 class="mb-0 text-muted small">
                        <i class="fas fa-hourglass-half me-1"></i>ВРЕМЯ
                      </h6>
                    </div>
                    <div class="d-flex justify-content-around">
                      <div v-if="selectedTask.estimated_hours" class="text-center">
                        <div class="fw-bold text-info">
                          <i class="fas fa-hourglass-start me-1"></i>{{ selectedTask.estimated_hours }}ч
                        </div>
                        <small class="text-muted">Оценка</small>
                      </div>
                      <div v-if="selectedTask.actual_hours" class="text-center">
                        <div class="fw-bold text-success">
                          <i class="fas fa-business-time me-1"></i>{{ selectedTask.actual_hours }}ч
                        </div>
                        <small class="text-muted">Потрачено</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Метаинформация -->
              <div class="meta-info p-3 bg-light rounded">
                <div class="row g-3">
                  <div class="col-6">
                    <small class="text-muted d-block mb-1">
                      <i class="fas fa-plus-circle me-1"></i>Создана
                    </small>
                    <div class="small">
                      {{ formatDateTime(selectedTask.created_at) }}
                      <span v-if="selectedTask.creator" class="text-muted">
                        ({{ getUserDisplayName(selectedTask.creator) }})
                      </span>
                    </div>
                  </div>
                  <div class="col-6" v-if="selectedTask.updated_at">
                    <small class="text-muted d-block mb-1">
                      <i class="fas fa-edit me-1"></i>Обновлена
                    </small>
                    <div class="small">{{ formatDateTime(selectedTask.updated_at) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light border-top">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Закрыть
            </button>
            <button @click="editTaskFromView" class="btn btn-primary">
              <i class="fas fa-edit me-2"></i>Редактировать
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import { Edit, Trash2, Plus, Home, Info, PieChart, ListTodo, Calendar, Clock, Users, CheckCircle, AlertTriangle, UserPlus, UserMinus, Download, Eye, Paperclip, FileText, X, FolderOpen, Upload, Save, List } from 'lucide-vue-next'
import projectManagementApi from '@/modules/crm/project-management/js/projectManagementApi.js'
import { useNotifications } from '@/modules/lms/composables/useNotifications'
import { getAvatarUrl } from '@/modules/cms/js/avatarUtils.js'

export default {
  name: 'ProjectDetail',
  components: {
    Edit,
    Trash2,
    Plus,
    Home,
    Info,
    PieChart,
    ListTodo,
    Calendar,
    Clock,
    Users,
    CheckCircle,
    AlertTriangle,
    UserPlus,
    UserMinus,
    Download,
    Eye,
    Paperclip,
    FileText,
    X,
    FolderOpen,
    Upload,
    Save,
    List
  },
  setup() {
    const { showSuccess, showError, showConfirmDialog, closeConfirmDialog } = useNotifications()
    return { showSuccess, showError, showConfirmDialog, closeConfirmDialog }
  },
  data() {
    return {
      loading: false,
      error: null,
      project: null,
      tasks: [],
      users: [],
      currentTask: {
        title: '',
        description: '',
        assignee_id: '',
        status: 'todo',
        priority: 'medium',
        start_date: '',
        due_date: '',
        estimated_hours: null,
        string_fields: []
      },
      currentProject: {
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'planning',
        priority: 'medium',
        color: '#007bff',
        string_fields: []
      },
      isEditingTask: false,
      isEditingProject: false,
      // Динамические данные для статусов и приоритетов
      projectStatuses: [],
      projectPriorities: [],
      taskStatuses: [],
      taskPriorities: [],
      loadingStatuses: false,
      // Управление командой проекта
      selectedUserId: '',
      selectedRole: '',
      loadingTeamAction: false,
      projectRoles: [], // список ролей из API
      selectedFiles: [],
      isDragOver: false,
      originalAttachments: [], // Для хранения исходного списка файлов при редактировании
      selectedTask: {}, // Для модального окна просмотра задачи
      selectedProjectFiles: [],
      isProjectDragOver: false,
      originalProjectAttachments: [], // Для хранения исходного списка файлов проекта при редактировании
      newStringFields: [] // Для хранения новых строковых полей
    }
  },
  async mounted() {
    await Promise.all([
      this.loadUsers(),
      this.loadStatusesAndPriorities(),
      this.loadProjectRoles() // загрузка ролей
    ])
    this.loadProjectData()
  },
  computed: {
    availableUsers() {
      if (!this.users || !this.project) return []
      
      // Исключаем пользователей, которые уже в команде
      const teamUserIds = new Set()
      
      // Добавляем владельца и менеджера (с проверкой на существование)
      if (this.project?.owner?.id) teamUserIds.add(this.project.owner.id)
      if (this.project?.manager?.id) teamUserIds.add(this.project.manager.id)
      
      // Добавляем участников команды
      if (this.project?.memberships && Array.isArray(this.project.memberships)) {
        this.project.memberships.forEach(member => {
          if (member && 
              typeof member === 'object' && 
              member.user && 
              typeof member.user === 'object' && 
              member.user.id) {
            teamUserIds.add(member.user.id)
          }
        })
      }
      
      // Возвращаем пользователей, которых нет в команде
      return this.users.filter(user => user?.id && !teamUserIds.has(user.id))
    },

    allTeamMembers() {
      if (!this.project?.memberships || !Array.isArray(this.project.memberships)) return []
      
      return this.project.memberships.filter(member => {
        // Строгая проверка валидности участника
        return member && 
               typeof member === 'object' && 
               member.user && 
               typeof member.user === 'object' && 
               member.user.id && 
               member.id
      })
    },

    filteredTeamMembers() {
      if (!this.project?.memberships || !Array.isArray(this.project.memberships)) return []
      
      return this.project.memberships.filter(member => {
        // Строгая проверка валидности member
        if (!member || typeof member !== 'object') return false
        if (!member.user || typeof member.user !== 'object') return false
        if (!member.user.id || !member.id) return false
        
        // Исключаем владельца и менеджера (они отображаются отдельно)
        const isOwner = this.project.owner?.id === member.user.id
        const isManager = this.project.manager?.id === member.user.id
        
        return !isOwner && !isManager
      })
    },

    allProjectMembers() {
      if (!this.project) return []
      
      const members = []
      const processedUserIds = new Set()
      
             // 1. Добавляем владельца (если есть)
       if (this.project.owner) {
         members.push({
           id: `owner-${this.project.owner.id}`,
           type: 'owner',
           user: this.project.owner,
           roleText: 'Владелец проекта',
           roleClass: 'owner-role',
           badges: [],
           canRemove: false,
           originalMember: null
         })
         processedUserIds.add(this.project.owner.id)
       }
      
      // 2. Добавляем менеджера (если есть и не совпадает с владельцем)
      if (this.project.manager && !processedUserIds.has(this.project.manager.id)) {
        members.push({
          id: `manager-${this.project.manager.id}`,
          type: 'manager',
          user: this.project.manager,
          roleText: 'Менеджер проекта',
          roleClass: 'manager-role',
          badges: [],
          canRemove: false,
          originalMember: null
        })
        processedUserIds.add(this.project.manager.id)
      }
      
      // 3. Добавляем всех участников команды
      if (this.project.memberships && Array.isArray(this.project.memberships)) {
        this.project.memberships.forEach(member => {
          if (member && 
              typeof member === 'object' && 
              member.user && 
              typeof member.user === 'object' && 
              member.user.id && 
              member.id) {
            const badges = []
            let roleText = this.getRoleText(member.role)
            let roleClass = this.getRoleClass(member.role)
            
            // Если пользователь уже обработан как владелец/менеджер, добавляем дополнительные бейджи
            if (processedUserIds.has(member.user.id)) {
              // Находим существующего участника и добавляем дополнительную роль
              const existingMember = members.find(m => m.user.id === member.user.id)
              if (existingMember) {
                existingMember.badges.push({
                  text: this.getRoleText(member.role),
                  class: this.getRoleBadgeClass(member.role)
                })
                existingMember.originalMember = member // Сохраняем для возможного удаления
              }
            } else {
              // Добавляем как нового участника
              members.push({
                id: `member-${member.id}`,
                type: 'member',
                user: member.user,
                roleText: roleText,
                roleClass: roleClass,
                badges: [],
                canRemove: true,
                originalMember: member
              })
              processedUserIds.add(member.user.id)
            }
          }
        })
      }
      
      return members
    }
  },
  watch: {
    '$route'() {
      this.loadProjectData()
    }
  },
  methods: {
    async loadProjectData() {
      const projectId = this.$route.params.id
      if (!projectId) {
        this.error = 'ID проекта не указан'
        return
      }

      this.loading = true
      this.error = null

      try {
        // Загружаем данные проекта
        const response = await projectManagementApi.getProject(projectId)
        this.project = response.data

        // Загружаем задачи проекта
        const tasksResponse = await projectManagementApi.getProjectTasks(projectId)
        this.tasks = Array.isArray(tasksResponse.data) ? tasksResponse.data.filter(task => task && task.id) : []
        
        // Обновляем прогресс проекта
        this.updateProjectProgress()
      } catch (error) {
        console.error('Ошибка загрузки проекта:', error)
        this.error = 'Ошибка загрузки данных проекта'
      } finally {
        this.loading = false
      }
    },

    async loadUsers() {
      try {
        const response = await projectManagementApi.getUsers()
        const users = Array.isArray(response.data.results) ? response.data.results : 
                      Array.isArray(response.data) ? response.data : []
        
        // Фильтруем только валидных пользователей
        this.users = users.filter(user => user && user.id)
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error)
        this.users = []
      }
    },

    async loadStatusesAndPriorities() {
      try {
        this.loadingStatuses = true
        const [projectStatusesRes, projectPrioritiesRes, taskStatusesRes, taskPrioritiesRes] = await Promise.all([
          projectManagementApi.getProjectStatuses(),
          projectManagementApi.getProjectPriorities(),
          projectManagementApi.getTaskStatuses(),
          projectManagementApi.getTaskPriorities()
        ])
        
        this.projectStatuses = Array.isArray(projectStatusesRes.data) ? 
          projectStatusesRes.data.filter(s => s.is_active) : 
          (projectStatusesRes.data.results || []).filter(s => s.is_active)
          
        this.projectPriorities = Array.isArray(projectPrioritiesRes.data) ? 
          projectPrioritiesRes.data.filter(p => p.is_active) : 
          (projectPrioritiesRes.data.results || []).filter(p => p.is_active)

        this.taskStatuses = Array.isArray(taskStatusesRes.data) ? 
          taskStatusesRes.data.filter(s => s.is_active) : 
          (taskStatusesRes.data.results || []).filter(s => s.is_active)
          
        this.taskPriorities = Array.isArray(taskPrioritiesRes.data) ? 
          taskPrioritiesRes.data.filter(p => p.is_active) : 
          (taskPrioritiesRes.data.results || []).filter(p => p.is_active)
      } catch (error) {
        console.error('Ошибка загрузки статусов и приоритетов:', error)
        // Fallback к жестко заданным значениям
        this.projectStatuses = [
          { id: 1, name: 'Планирование', code: 'planning' },
          { id: 2, name: 'Активный', code: 'active' },
          { id: 3, name: 'Приостановлен', code: 'on_hold' },
          { id: 4, name: 'Завершен', code: 'completed' },
          { id: 5, name: 'Отменен', code: 'cancelled' }
        ]
        this.projectPriorities = [
          { id: 1, name: 'Низкий', code: 'low' },
          { id: 2, name: 'Средний', code: 'medium' },
          { id: 3, name: 'Высокий', code: 'high' },
          { id: 4, name: 'Срочный', code: 'urgent' }
        ]
        this.taskStatuses = [
          { id: 1, name: 'К выполнению', code: 'todo' },
          { id: 2, name: 'В работе', code: 'in_progress' },
          { id: 3, name: 'На проверке', code: 'review' },
          { id: 4, name: 'Выполнено', code: 'done' },
          { id: 5, name: 'Отменено', code: 'cancelled' }
        ]
        this.taskPriorities = [
          { id: 1, name: 'Низкий', code: 'low' },
          { id: 2, name: 'Средний', code: 'medium' },
          { id: 3, name: 'Высокий', code: 'high' },
          { id: 4, name: 'Срочный', code: 'urgent' }
        ]
      } finally {
        this.loadingStatuses = false
      }
    },

    async loadProjectRoles() {
      try {
        const res = await projectManagementApi.getProjectRoles()
        this.projectRoles = res.data
      } catch (e) {
        this.projectRoles = []
      }
    },

    async refreshStatusesAndPriorities() {
      // Обновляем статусы и приоритеты если они еще не загружены
      if (this.taskStatuses.length === 0 || this.taskPriorities.length === 0) {
        await this.loadStatusesAndPriorities()
      }
    },

    editProject() {
      if (!this.project) return
      
      this.isEditingProject = true
      
      // Загружаем полную информацию о проекте с вложениями и строковыми полями
      this.currentProject = {
        id: this.project.id,
        name: this.project.name,
        description: this.project.description,
        start_date: this.project.start_date || '',
        end_date: this.project.end_date || '',
        status: this.project.status,
        priority: this.project.priority,
        color: this.project.color,
        status_ref_id: this.project.status_ref_id || null,
        priority_ref_id: this.project.priority_ref_id || null,
        attachments: this.project.attachments || [], // Загружаем существующие вложения
        string_fields: this.project.string_fields || [] // Загружаем существующие строковые поля
      }
      
      // Сохраняем исходный список файлов
      this.originalProjectAttachments = [...(this.project.attachments || [])]
      
      // Очищаем выбранные файлы
      this.selectedProjectFiles = []
      
      const modal = new Modal(document.getElementById('projectModal'))
      modal.show()
    },

    async createTask() {
      this.isEditingTask = false
      
      // Обновляем статусы и приоритеты перед созданием задачи
      await this.refreshStatusesAndPriorities()
      
      // Устанавливаем значения по умолчанию из загруженных данных
      const defaultStatus = this.taskStatuses.find(s => s.is_default) || this.taskStatuses[0]
      const defaultPriority = this.taskPriorities.find(p => p.is_default) || this.taskPriorities[0]
      
      this.currentTask = {
        title: '',
        description: '',
        assignee_id: '',
        status: defaultStatus ? defaultStatus.code : 'todo',
        priority: defaultPriority ? defaultPriority.code : 'medium',
        start_date: '',
        due_date: '',
        estimated_hours: null,
        string_fields: []
      }
      
      // Очищаем выбранные файлы
      this.selectedFiles = []
      this.originalAttachments = []
      
      const modal = new Modal(document.getElementById('taskModal'))
      modal.show()
    },
    
    async editTask(task) {
      this.isEditingTask = true
      
      try {
        // Загружаем полную информацию о задаче с вложениями
        const response = await projectManagementApi.getTask(task.id)
        const fullTask = response.data
        
        this.currentTask = {
          id: fullTask.id,
          title: fullTask.title,
          description: fullTask.description,
          assignee_id: fullTask.assignee?.id,
          status: fullTask.status,
          priority: fullTask.priority,
          start_date: fullTask.start_date ? this.formatDateTimeLocal(new Date(fullTask.start_date)) : '',
          due_date: fullTask.due_date ? this.formatDateTimeLocal(new Date(fullTask.due_date)) : '',
          estimated_hours: fullTask.estimated_hours,
          attachments: fullTask.attachments || [], // Загружаем существующие вложения
          string_fields: fullTask.string_fields || [] // Загружаем дополнительные поля
        }
        
        // Сохраняем исходный список файлов
        this.originalAttachments = [...(fullTask.attachments || [])]
      } catch (error) {
        console.error('Ошибка загрузки задачи:', error)
        // Fallback к данным из списка
        this.currentTask = {
          id: task.id,
          title: task.title,
          description: task.description,
          assignee_id: task.assignee?.id,
          status: task.status,
          priority: task.priority,
          start_date: task.start_date ? this.formatDateTimeLocal(new Date(task.start_date)) : '',
          due_date: task.due_date ? this.formatDateTimeLocal(new Date(task.due_date)) : '',
          estimated_hours: task.estimated_hours,
          attachments: task.attachments || [],
          string_fields: task.string_fields || []
        }
        this.originalAttachments = [...(task.attachments || [])]
      }
      
      // Очищаем выбранные файлы при редактировании
      this.selectedFiles = []
      
      const modal = new Modal(document.getElementById('taskModal'))
      modal.show()
    },

    deleteTask(task) {
      this.confirmDeleteTask(task)
    },

    async submitProject() {
      try {
        // Подготавливаем данные проекта, исключая attachments
        const projectData = {
          id: this.currentProject.id,
          name: this.currentProject.name,
          description: this.currentProject.description,
          start_date: this.currentProject.start_date || null,
          end_date: this.currentProject.end_date || null,
          status: this.currentProject.status,
          priority: this.currentProject.priority,
          color: this.currentProject.color,
          // Добавляем новые поля для статусов и приоритетов
          status_ref_id: this.currentProject.status_ref_id || null,
          priority_ref_id: this.currentProject.priority_ref_id || null
        }
        
        console.log('Отправляемые данные проекта:', projectData)
        
        const response = await projectManagementApi.updateProject(projectData.id, projectData)
        
        // Удаляем файлы, которые были убраны из списка
        const removedFiles = this.originalProjectAttachments.filter(file => 
          !this.currentProject.attachments.find(current => current.id === file.id)
        )
        
        for (const file of removedFiles) {
          try {
            await projectManagementApi.deleteProjectAttachment(file.id)
          } catch (error) {
            console.error('Ошибка удаления файла проекта:', error)
          }
        }
        
        // Загружаем новые файлы
        if (this.selectedProjectFiles.length > 0) {
          await this.uploadProjectFiles(this.currentProject.id)
        }
        
        // Создаем новые строковые поля
        const newStringFields = this.currentProject.string_fields.filter(field => field.is_new)
        for (const field of newStringFields) {
          try {
            await projectManagementApi.createProjectStringField({
              project: this.currentProject.id,
              value: field.value,
              order: field.order
            })
          } catch (error) {
            console.error('Ошибка создания строкового поля:', error)
          }
        }
        
        // Закрываем модальное окно
        const modal = Modal.getInstance(document.getElementById('projectModal'))
        if (modal) modal.hide()
        
        // Перезагружаем данные
        this.loadProjectData()
        
        this.showSuccess('Проект обновлен')
      } catch (error) {
        console.error('Ошибка обновления проекта:', error)
        console.error('Детали ошибки:', error.response?.data)
        this.showError('Ошибка обновления проекта')
      }
    },

    async submitTask() {
      try {
        // Подготавливаем данные задачи
        const taskData = {
          ...this.currentTask,
          project_id: this.project.id, // Всегда устанавливаем project_id
          assignee_id: this.currentTask.assignee_id || null,
          start_date: this.currentTask.start_date || null,
          due_date: this.currentTask.due_date || null,
          estimated_hours: this.currentTask.estimated_hours || null
        }
        
        let taskId
        if (this.isEditingTask) {
          const response = await projectManagementApi.updateTask(taskData.id, taskData)
          taskId = taskData.id
          
          // Удаляем файлы, которые были убраны из списка
          const removedFiles = this.originalAttachments.filter(file => 
            !this.currentTask.attachments.find(current => current.id === file.id)
          )
          
          for (const file of removedFiles) {
            try {
              await projectManagementApi.deleteTaskAttachment(file.id)
            } catch (error) {
              console.error('Ошибка удаления файла:', error)
            }
          }
        } else {
          const response = await projectManagementApi.createTask(taskData)
          taskId = response.data.id
        }
        
        // Загружаем новые файлы
        if (this.selectedFiles.length > 0) {
          await this.uploadTaskFiles(taskId)
        }
        
        // Обработка дополнительных полей
        // Создаем новые поля
        const newStringFieldsToCreate = this.currentTask.string_fields.filter(field => field.is_new)
        for (const field of newStringFieldsToCreate) {
          try {
            await projectManagementApi.createTaskStringField({
              task: taskId,
              value: field.value,
              order: field.order
            })
          } catch (error) {
            console.error('Ошибка создания нового строкового поля:', error)
          }
        }
        
        // Закрываем модальное окно
        const modal = Modal.getInstance(document.getElementById('taskModal'))
        if (modal) modal.hide()
        
        // Перезагружаем данные
        this.loadProjectData()
        
        this.showSuccess(this.isEditingTask ? 'Задача обновлена' : 'Задача создана')
      } catch (error) {
        console.error('Ошибка сохранения задачи:', error)
        this.showError('Ошибка сохранения задачи')
      }
    },

    async confirmDeleteProject() {
      const confirmed = await this.showConfirmDialog({
        title: 'Удаление проекта',
        message: `Вы уверены, что хотите удалить проект "${this.project.name}"? Это действие необратимо.`,
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        variant: 'danger'
      })
      
      if (confirmed) {
        try {
          await projectManagementApi.deleteProject(this.project.id)
          this.closeConfirmDialog()
          this.showSuccess('Проект успешно удален!')
          // Переходим к списку проектов
          this.$router.push('/crm/project-management/projects')
        } catch (error) {
          console.error('Ошибка удаления проекта:', error)
          this.closeConfirmDialog()
          this.showError('Ошибка удаления проекта')
        }
      }
    },

    async confirmDeleteTask(task) {
      const confirmed = await this.showConfirmDialog({
        title: 'Удаление задачи',
        message: `Вы уверены, что хотите удалить задачу "${task.title}"?`,
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        variant: 'danger'
      })
      
      if (confirmed) {
        try {
          await projectManagementApi.deleteTask(task.id)
          this.closeConfirmDialog()
          await this.loadProjectData()
          this.showSuccess('Задача удалена')
        } catch (error) {
          console.error('Ошибка удаления задачи:', error)
          this.closeConfirmDialog()
          this.showError('Ошибка удаления задачи')
        }
      }
    },

    getStatusClass(status) {
      const classes = {
        'planning': 'bg-secondary',
        'active': 'bg-success',
        'on_hold': 'bg-warning',
        'completed': 'bg-primary',
        'cancelled': 'bg-danger'
      }
      return classes[status] || 'bg-secondary'
    },

    getStatusText(status) {
      if (!status) return 'Не указан'
      const statusObj = this.projectStatuses?.find(s => s.code === status)
      return statusObj?.name || status
    },

    getTaskStatusClass(status) {
      const statusMap = {
        'todo': 'bg-secondary',
        'in_progress': 'bg-primary',
        'review': 'bg-warning',
        'done': 'bg-success',
        'cancelled': 'bg-danger'
      }
      return statusMap[status] || 'bg-secondary'
    },

    getTaskStatusText(status) {
      const statusMap = {
        'todo': 'К выполнению',
        'in_progress': 'В работе',
        'review': 'На проверке',
        'done': 'Выполнено',
        'cancelled': 'Отменено'
      }
      return statusMap[status] || status
    },

    getPriorityClass(priority) {
      const classes = {
        'low': 'bg-secondary',
        'medium': 'bg-primary',
        'high': 'bg-warning',
        'urgent': 'bg-danger'
      }
      return classes[priority] || 'bg-secondary'
    },

    getPriorityText(priority) {
      if (!priority) return 'Не указан'
      // Сначала ищем в приоритетах задач, потом в приоритетах проектов
      const taskPriorityObj = this.taskPriorities?.find(p => p.code === priority)
      const projectPriorityObj = this.projectPriorities?.find(p => p.code === priority)
      return taskPriorityObj?.name || projectPriorityObj?.name || priority
    },

    getProgressClass(progress) {
      if (progress >= 80) return 'bg-success'
      if (progress >= 50) return 'bg-warning'
      return 'bg-danger'
    },

    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('ru-RU')
    },

    formatDateTimeLocal(date) {
      if (!date) return ''
      return new Date(date).toISOString().slice(0, 16)
    },



    updateProjectProgress() {
      if (!this.project || !Array.isArray(this.tasks)) return
      
      // Фильтруем только валидные задачи
      const validTasks = this.tasks.filter(task => task && task.status)
      const totalTasks = validTasks.length
      const completedTasks = validTasks.filter(task => task.status === 'done').length
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      
      // Обновляем локальные данные проекта
      this.project.task_count = totalTasks
      this.project.completed_task_count = completedTasks
      this.project.progress = progress
    },

    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },

    getDueDateClass(dueDate, status) {
      if (!dueDate) return 'text-muted'
      
      const now = new Date()
      const due = new Date(dueDate)
      
      if (status === 'done') return 'text-success'
      if (due < now) return 'text-danger'
      if (due.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'text-warning'
      
      return 'text-dark'
    },

    formatDateTime(date) {
      if (!date) return 'Не указана'
      return new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatDateTimeLocal(date) {
      if (!date) return ''
      return new Date(date).toISOString().slice(0, 16)
    },
    
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },

    getBackRoute() {
      // Проверяем query параметр from для определения откуда пришли
      const from = this.$route.query.from
      if (from === 'management') {
        return '/crm/project-management/management'
      }
      // По умолчанию возвращаемся в "Мои проекты"
      return '/crm/project-management/my-projects'
    },

    getBackRouteTitle() {
      const from = this.$route.query.from
      if (from === 'management') {
        return 'Проекты и задачи'
      }
      return 'Мои проекты'
    },

    // Методы для управления командой проекта
    openTeamModal() {
      this.selectedUserId = ''
      this.selectedRole = ''
      const modal = new Modal(document.getElementById('teamModal'))
      modal.show()
    },

    async addMember() {
      if (!this.selectedUserId || !this.selectedRole || !this.project?.id) {
        this.showError('Пожалуйста, выберите пользователя и роль')
        return
      }

      this.loadingTeamAction = true
      try {
        const memberData = {
          user_id: this.selectedUserId,
          role_id: this.selectedRole
        }

        const response = await projectManagementApi.addProjectMember(this.project.id, memberData)
        await this.refreshTeamData()
        this.selectedUserId = ''
        this.selectedRole = ''
        this.showSuccess('Участник добавлен в команду проекта!')
      } catch (error) {
        console.error('Ошибка добавления участника:', error)
        
        let errorMessage = 'Ошибка добавления участника'
        if (error.response?.data) {
          if (typeof error.response.data === 'object') {
            const errors = []
            for (const [field, messages] of Object.entries(error.response.data)) {
              if (Array.isArray(messages)) {
                errors.push(`${field}: ${messages.join(', ')}`)
              } else {
                errors.push(`${field}: ${messages}`)
              }
            }
            if (errors.length > 0) {
              errorMessage += ':\n' + errors.join('\n')
            }
          } else {
            errorMessage += ': ' + error.response.data
          }
        }
        
        this.showError(errorMessage)
      } finally {
        this.loadingTeamAction = false
      }
    },

    async removeMember(member) {
      if (!member?.user?.id || !this.project?.id) {
        this.showError('Ошибка: данные участника или проекта недоступны')
        return
      }

      const userName = this.getUserDisplayName(member.user)
      const confirmed = await this.showConfirmDialog({
        title: 'Исключение из команды',
        message: `Вы уверены, что хотите исключить ${userName} из команды проекта?`,
        confirmText: 'Исключить',
        cancelText: 'Отмена',
        variant: 'danger'
      })

      if (!confirmed) {
        this.closeConfirmDialog()
        return
      }

      try {
        await projectManagementApi.removeProjectMember(this.project.id, member.user.id)
        this.closeConfirmDialog()
        
        // Обновляем данные команды
        await this.refreshTeamData()
        
        this.showSuccess('Участник исключен из команды проекта!')
      } catch (error) {
        console.error('Ошибка удаления участника:', error)
        this.closeConfirmDialog()
        this.showError('Ошибка исключения участника из команды')
      }
    },

    getRoleText(role) {
      const roles = {
        'member': 'Участник',
        'lead': 'Ведущий',
        'observer': 'Наблюдатель'
      }
      return roles[role] || role
    },

    getRoleClass(role) {
      const classes = {
        'member': 'member-role',
        'lead': 'lead-role',
        'observer': 'observer-role'
      }
      return classes[role] || 'member-role'
    },

    getRoleBadgeClass(role) {
      const classes = {
        'member': 'bg-secondary',
        'lead': 'bg-warning',
        'observer': 'bg-info'
      }
      return classes[role] || 'bg-secondary'
    },

    getUserDisplayName(user) {
      if (!user) return 'Неизвестный пользователь'
      
      if (user.full_name) {
        return user.full_name
      }
      
      if (user.first_name || user.last_name) {
        return `${user.first_name || ''} ${user.last_name || ''}`.trim()
      }
      
      return user.username || user.email || 'Пользователь'
    },

    getAvatarUrl(user) {
      // Используем локальную утилиту для генерации аватаров
      return getAvatarUrl(user, 40)
    },

    async refreshTeamData() {
      // Принудительное обновление только данных команды
      if (!this.project?.id) return
      
      try {
        const response = await projectManagementApi.getProject(this.project.id)
        
        // Обновляем только поле memberships
        if (this.project) {
          this.project.memberships = response.data.memberships || []
        }
      } catch (error) {
        console.error('Ошибка обновления команды:', error)
        this.showError('Ошибка обновления данных команды')
      }
    },

    async removeExistingFile(fileId) {
      // Удаляем файл из списка текущих вложений
      this.currentTask.attachments = this.currentTask.attachments.filter(file => file.id !== fileId);
      // Файл будет физически удален при сохранении задачи
    },

    onFileDrop(event) {
      this.isDragOver = false
      const files = Array.from(event.dataTransfer.files)
      this.addFiles(files)
    },
    
    onFileSelect(event) {
      const files = Array.from(event.target.files)
      this.addFiles(files)
      // Сбрасываем input для возможности повторного выбора тех же файлов
      event.target.value = ''
    },
    
    addFiles(files) {
      files.forEach(file => {
        // Проверяем, что файл еще не добавлен
        if (!this.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
          this.selectedFiles.push(file)
        }
      })
    },
    
    removeFile(index) {
      this.selectedFiles.splice(index, 1)
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    async uploadTaskFiles(taskId) {
      if (this.selectedFiles.length === 0) return
      
      console.log('Загружаем файлы для задачи:', taskId)
      console.log('Файлы для загрузки:', this.selectedFiles.map(f => ({ name: f.name, size: f.size })))
      
      const uploadPromises = this.selectedFiles.map(file => 
        projectManagementApi.uploadTaskAttachment(file, taskId)
      )
      
      try {
        await Promise.all(uploadPromises)
        this.selectedFiles = [] // Очищаем список после успешной загрузки
        console.log('Файлы успешно загружены')
      } catch (error) {
        console.error('Ошибка загрузки файлов:', error)
        console.error('Детали ошибки:', error.response?.data)
        this.showError('Ошибка загрузки файлов')
      }
    },

    onDragEnter(event) {
      this.isDragOver = true
    },
    
    onDragLeave(event) {
      // Проверяем, что мы действительно покидаем зону, а не переходим к дочернему элементу
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.isDragOver = false
      }
    },

    async viewTask(task) {
      try {
        // Загружаем полную информацию о задаче с вложениями
        const response = await projectManagementApi.getTask(task.id)
        this.selectedTask = response.data
      } catch (error) {
        console.error('Ошибка загрузки задачи:', error)
        // Fallback к данным из списка
        this.selectedTask = task
      }
      
      const modal = new Modal(document.getElementById('taskViewModal'))
      modal.show()
    },

    editTaskFromView() {
      this.editTask(this.selectedTask)
      
      // Закрываем модальное окно просмотра
      const viewModal = Modal.getInstance(document.getElementById('taskViewModal'))
      if (viewModal) viewModal.hide()
    },

    async deleteAttachment(file) {
      try {
        await this.showConfirmDialog(
          'Удалить файл?',
          `Вы уверены, что хотите удалить файл "${file.filename}"?`
        )
        
        await projectManagementApi.deleteTaskAttachment(file.id)
        
        // Удаляем файл из списка
        this.selectedTask.attachments = this.selectedTask.attachments.filter(f => f.id !== file.id)
        
        this.showSuccess('Файл удален')
      } catch (error) {
        if (error !== 'cancelled') {
          console.error('Ошибка удаления файла:', error)
          this.showError('Ошибка удаления файла')
        }
      }
    },

    // Методы для работы с файлами проектов
    async removeExistingProjectFile(fileId) {
      // Удаляем файл из списка текущих вложений
      this.currentProject.attachments = this.currentProject.attachments.filter(file => file.id !== fileId);
      // Файл будет физически удален при сохранении проекта
    },

    onProjectFileDrop(event) {
      this.isProjectDragOver = false
      const files = Array.from(event.dataTransfer.files)
      this.addProjectFiles(files)
    },
    
    onProjectFileSelect(event) {
      const files = Array.from(event.target.files)
      this.addProjectFiles(files)
      // Сбрасываем input для возможности повторного выбора тех же файлов
      event.target.value = ''
    },
    
    addProjectFiles(files) {
      files.forEach(file => {
        // Проверяем, что файл еще не добавлен
        if (!this.selectedProjectFiles.find(f => f.name === file.name && f.size === file.size)) {
          this.selectedProjectFiles.push(file)
        }
      })
    },
    
    removeProjectFile(index) {
      this.selectedProjectFiles.splice(index, 1)
    },
    
    async uploadProjectFiles(projectId) {
      if (this.selectedProjectFiles.length === 0) return
      
      console.log('Загружаем файлы для проекта:', projectId)
      console.log('Файлы для загрузки:', this.selectedProjectFiles.map(f => ({ name: f.name, size: f.size })))
      
      const uploadPromises = this.selectedProjectFiles.map(file => 
        projectManagementApi.uploadProjectAttachment(file, projectId)
      )
      
      try {
        await Promise.all(uploadPromises)
        this.selectedProjectFiles = [] // Очищаем список после успешной загрузки
        console.log('Файлы проекта успешно загружены')
      } catch (error) {
        console.error('Ошибка загрузки файлов проекта:', error)
        console.error('Детали ошибки:', error.response?.data)
        this.showError('Ошибка загрузки файлов проекта')
      }
    },

    onProjectDragEnter(event) {
      this.isProjectDragOver = true
    },
    
    onProjectDragLeave(event) {
      // Проверяем, что мы действительно покидаем зону, а не переходим к дочернему элементу
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.isProjectDragOver = false
      }
    },

    downloadFile(file) {
      // Создаем временную ссылку для скачивания
      const link = document.createElement('a')
      link.href = file.file
      link.download = file.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    viewFile(file) {
      // Открываем файл в новой вкладке для просмотра
      window.open(file.file, '_blank')
    },

    async deleteProjectFile(file) {
      try {
        await this.showConfirmDialog(
          'Удалить файл?',
          `Вы уверены, что хотите удалить файл "${file.filename}"?`
        )
        
        await projectManagementApi.deleteProjectAttachment(file.id)
        
        // Удаляем файл из списка
        this.project.attachments = this.project.attachments.filter(f => f.id !== file.id)
        
        this.showSuccess('Файл удален')
      } catch (error) {
        if (error !== 'cancelled') {
          console.error('Ошибка удаления файла проекта:', error)
          this.showError('Ошибка удаления файла')
        }
      }
    },

    addStringField() {
      // Просто добавляем поле в интерфейс
      this.currentProject.string_fields.push({
        id: `temp_${Date.now()}_${Math.random()}`, // Временный ID
        value: '',
        order: this.currentProject.string_fields.length,
        is_new: true // Флаг для определения новых полей
      })
    },

    removeStringField(fieldId, index) {
      // Просто удаляем поле из интерфейса
      this.currentProject.string_fields.splice(index, 1)
    },

    updateStringField(field) {
      // Обновляем только существующие поля (не новые)
      if (!field.is_new && field.id) {
        try {
          const updateData = {
            value: field.value,
            order: field.order
          }
          
          projectManagementApi.updateProjectStringField(field.id, updateData)
            .then(() => {
              this.showSuccess('Поле обновлено')
            })
            .catch((error) => {
              console.error('Ошибка обновления поля:', error)
              console.error('Детали ошибки:', error.response?.data)
              this.showError('Ошибка обновления поля')
            })
        } catch (error) {
          console.error('Ошибка обновления поля:', error)
          this.showError('Ошибка обновления поля')
        }
      }
    },

    addTaskStringField() {
      // Просто добавляем поле в интерфейс
      this.currentTask.string_fields.push({
        id: `temp_${Date.now()}_${Math.random()}`, // Временный ID
        value: '',
        order: this.currentTask.string_fields.length,
        is_new: true // Флаг для определения новых полей
      })
    },

    removeTaskStringField(fieldId, index) {
      // Просто удаляем поле из интерфейса
      this.currentTask.string_fields.splice(index, 1)
    },

    updateTaskStringField(field) {
      // Обновляем только существующие поля (не новые)
      if (!field.is_new && field.id) {
        projectManagementApi.updateTaskStringField(field.id, {
          value: field.value,
          order: field.order
        })
        .then(() => {
          this.showSuccess('Поле обновлено')
        })
        .catch(error => {
          console.error('Ошибка обновления поля:', error)
          this.showError('Ошибка обновления поля')
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import './project-management.scss';

.project-detail-page {
  padding: 2rem;
  min-height: 100vh;
  background: var(--bs-gray-100);
}

// Заголовок страницы
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: $radius-usual;
  box-shadow: $pm-card-shadow;
  
  .header-content {
    flex: 1;
  }
  
  .header-actions {
    display: flex;
    gap: 0.75rem;
    margin-left: 2rem;
  }
}

// Хлебные крошки
.breadcrumb-nav {
  margin-bottom: 1rem;
  
  .breadcrumb {
    background: transparent;
    padding: 0;
    margin: 0;
    
    .breadcrumb-item {
      font-size: 0.875rem;
      
      .breadcrumb-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bs-secondary-color);
        text-decoration: none;
        transition: color 0.2s ease;
        
        &:hover {
          color: var(--bs-primary);
        }
      }
      
      &.active {
        color: var(--bs-heading-color);
        font-weight: 600;
      }
    }
  }
}

// Секция заголовка проекта
.project-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .project-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .project-title {
    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--bs-heading-color);
      margin: 0 0 0.5rem 0;
    }
    
    .project-meta-badges {
      display: flex;
      gap: 0.5rem;
      
      .badge {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 6px;
      }
    }
  }
}

// Кнопки в заголовке
.header-actions {
  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

// Состояния загрузки и ошибки
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: $radius-usual;
  box-shadow: $pm-card-shadow;
  
  h3 {
    margin: 1rem 0 0.5rem 0;
    color: var(--bs-heading-color);
  }
  
  p {
    color: var(--bs-secondary-color);
    margin-bottom: 1.5rem;
  }
}

.spinner-container {
  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--bs-gray-200);
    border-left-color: var(--bs-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  .error-icon {
    color: var(--bs-danger);
    margin-bottom: 1rem;
  }
}

// Основной контент
.project-content {
  .info-section {
    margin-bottom: 2rem;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 1.5rem;
    
    @media (max-width: 1200px) {
      grid-template-columns: 1fr 1fr;
    }
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

// Карточки информации
.info-card {
  background: white;
  border-radius: $radius-usual;
  box-shadow: $pm-card-shadow;
  padding: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: $pm-card-hover-shadow;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--bs-border-color);
    
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--bs-heading-color);
      margin: 0;
    }
  }
  
  .card-body {
    .description-section {
      margin-bottom: 1.5rem;
      
      .description {
        color: var(--bs-secondary-color);
        line-height: 1.6;
        margin: 0;
      }
    }
  }
}

// Сетка метаданных
.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--bs-gray-100);
    border-radius: 8px;
    
    .meta-icon {
      color: var(--bs-secondary-color);
    }
    
    .meta-content {
      display: flex;
      flex-direction: column;
      
      .meta-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--bs-secondary-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .meta-value {
        font-weight: 600;
        color: var(--bs-heading-color);
      }
    }
  }
}

// Секция статистики
.stats-card {
  .progress-section {
    margin-bottom: 1.5rem;
    
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      
      span {
        font-size: 0.875rem;
        color: var(--bs-secondary-color);
      }
      
      .progress-value {
        font-weight: 600;
        color: var(--bs-primary);
      }
    }
    
    .progress-bar-container {
      height: 8px;
      background: var(--bs-gray-200);
      border-radius: 4px;
      overflow: hidden;
      
      .progress-bar {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
        
        &.bg-success { background: var(--bs-success); }
        &.bg-warning { background: var(--bs-warning); }
        &.bg-danger { background: var(--bs-danger); }
      }
    }
  }
  
  .stats-grid {
    display: grid;
    gap: 1rem;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bs-gray-100);
      border-radius: 8px;
      
      .stat-icon {
        color: var(--bs-primary);
        
        &.completed { color: var(--bs-success); }
        &.in-progress { color: var(--bs-warning); }
      }
      
      .stat-content {
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--bs-heading-color);
          line-height: 1;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: var(--bs-secondary-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }
  }
}

// Секция команды
.team-card {
  .card-header {
    justify-content: space-between;
    
    .btn {
      margin-left: auto;
    }
  }
  
  .team-members {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    .team-member {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bs-gray-100);
      border-radius: 8px;
      position: relative;
      
      .member-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .member-info {
        flex: 1;
        
        .member-name {
          font-weight: 600;
          color: var(--bs-heading-color);
        }
        
        .member-role {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          
          &.owner-role {
            color: var(--bs-success);
            font-weight: 600;
          }
          
          &.manager-role {
            color: var(--bs-primary);
            font-weight: 600;
          }
          
          &.lead-role {
            color: var(--bs-warning);
            font-weight: 600;
          }
          
          &.member-role {
            color: var(--bs-secondary);
          }
          
          &.observer-role {
            color: var(--bs-info);
          }
        }
      }
      
      .member-actions {
        display: flex;
        gap: 0.25rem;
      }
    }
    
    .empty-team {
      text-align: center;
      padding: 2rem;
      
      .empty-icon {
        color: var(--bs-gray-400);
        margin-bottom: 1rem;
      }
      
      p {
        color: var(--bs-secondary-color);
        margin-bottom: 1rem;
      }
    }
  }
}

// Модальное окно управления командой
#teamModal {
  .modal-body {
    .current-team {
      max-height: 300px;
      overflow-y: auto;
      
      .team-member-modal {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: var(--bs-gray-100);
        border-radius: 6px;
        margin-bottom: 0.5rem;
        
        .member-avatar-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .member-info-modal {
          flex: 1;
          
          .member-name {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--bs-heading-color);
          }
          
          .member-role {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            
            &.owner-role {
              color: var(--bs-success);
            }
            
            &.manager-role {
              color: var(--bs-primary);
            }
            
            &.lead-role {
              color: var(--bs-warning);
            }
            
            &.member-role {
              color: var(--bs-secondary);
            }
            
            &.observer-role {
              color: var(--bs-info);
            }
          }
        }
      }
    }
    
    .add-member-form {
      .form-label {
        font-weight: 600;
        color: var(--bs-heading-color);
      }
    }
  }
}

// Секция задач
.tasks-section {
  background: white;
  border-radius: $radius-usual;
  box-shadow: $pm-card-shadow;
  overflow: hidden;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--bs-border-color);
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      
      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--bs-heading-color);
        margin: 0;
      }
    }
    
    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  .tasks-content {
    padding: 1.5rem;
    
    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      
      .empty-icon {
        color: var(--bs-gray-400);
        margin-bottom: 1rem;
      }
      
      h3 {
        color: var(--bs-heading-color);
        margin-bottom: 0.5rem;
      }
      
      p {
        color: var(--bs-secondary-color);
        margin-bottom: 1.5rem;
      }
      
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 2rem;
        font-weight: 600;
        border-radius: 8px;
      }
    }
  }
}

// Таблица задач
.tasks-table-container {
  .tasks-table {
    width: 100%;
    border-collapse: collapse;
    
    thead {
      background: var(--bs-gray-100);
      
      th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: var(--bs-heading-color);
        border-bottom: 2px solid var(--bs-border-color);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
    
    tbody {
      tr {
        border-bottom: 1px solid var(--bs-border-color);
        transition: background-color 0.2s ease;
        
        &:hover {
          background: var(--bs-gray-50);
        }
        
        td {
          padding: 1rem;
          vertical-align: top;
        }
      }
    }
  }
}

// Ячейки таблицы
.task-cell {
  .task-info {
    .task-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--bs-heading-color);
      margin: 0 0 0.5rem 0;
    }
    
    .task-description {
      font-size: 0.875rem;
      color: var(--bs-secondary-color);
      margin: 0;
      line-height: 1.4;
    }
  }
}

.assignee-cell {
  .assignee-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .assignee-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .assignee-name {
      font-weight: 600;
      color: var(--bs-heading-color);
    }
  }
  
  .no-assignee {
    color: var(--bs-secondary-color);
    font-style: italic;
  }
}

.status-cell,
.priority-cell {
  .badge {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 6px;
  }
}

.due-date-cell {
  span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    
    &.text-danger { color: var(--bs-danger); }
    &.text-warning { color: var(--bs-warning); }
    &.text-primary { color: var(--bs-primary); }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .project-detail-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    
    .header-actions {
      margin-left: 0;
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  .project-title-section {
    .project-title h1 {
      font-size: 1.5rem;
    }
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .tasks-section {
    .section-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
  }
  
  .tasks-table-container {
    overflow-x: auto;
    
    .tasks-table {
      min-width: 600px;
    }
  }
}

// Кнопки действий в таблице
.actions-cell {
  .action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    
    .btn-edit-icon,
    .btn-delete-icon {
      width: 32px;
      height: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s ease;
      background: transparent;
      border: 1px solid;
      cursor: pointer;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }
    }
    
    .btn-edit-icon {
      border-color: var(--bs-primary);
      color: var(--bs-primary);
      
      &:hover {
        background-color: var(--bs-primary);
        color: white;
      }
    }
    
    .btn-delete-icon {
      border-color: var(--bs-danger);
      color: var(--bs-danger);
      
      &:hover {
        background-color: var(--bs-danger);
        color: white;
      }
    }
  }
}

.string-fields-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.string-field-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-group input[type="text"] {
  flex: 1;
}

.input-group button[type="button"] {
  background: none;
  border: none;
  cursor: pointer;
}
</style> 