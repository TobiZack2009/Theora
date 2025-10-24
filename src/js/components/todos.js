import { appState } from '../state/appState.js';
import { generateId, getRelativeTime, isToday } from '../utils/helpers.js';
import { generateTimeManagementAdvice } from '../services/ai.js';

export function renderTodos(container) {
  let filteredTodos = appState.todos.filter(t => !t.completed);
  const completedTodos = appState.todos.filter(t => t.completed);

  // Apply filter based on appState.todoFilter
  switch (appState.todoFilter) {
    case 'today':
      filteredTodos = filteredTodos.filter(t => isToday(t.dueDate));
      break;
    case 'week':
      filteredTodos = filteredTodos.filter(t => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return t.dueDate && new Date(t.dueDate) >= oneWeekAgo;
      });
      break;
    case 'month':
      filteredTodos = filteredTodos.filter(t => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return t.dueDate && new Date(t.dueDate) >= oneMonthAgo;
      });
      break;
    case 'high':
      filteredTodos = filteredTodos.filter(t => t.priority === 'high');
      break;
    case 'all':
    default:
      // No additional filtering needed
      break;
  }

  const incompleteTodos = filteredTodos;

  container.innerHTML = `
    <div class="fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold">My Todos</h2>
        <button id="addTodoBtn" class="btn btn-primary">+ Add Todo</button>
      </div>

      

      <!-- AI Time Management Advice -->
      <div id="aiTimeManagementAdvice" class="card mb-6">
        <h3 class="text-xl font-semibold mb-4">AI Time Management Advice</h3>
        <p id="aiAdviceContent" class="text-text-secondary">Loading personalized advice...</p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="today">Today</button>
        <button class="filter-btn" data-filter="week">This Week</button>
        <button class="filter-btn" data-filter="month">This Month</button>
        <button class="filter-btn" data-filter="high">High Priority</button>
      </div>

      <!-- Incomplete Todos -->
      <div class="card mb-6">
        <h3 class="text-xl font-semibold mb-4">To Do (${incompleteTodos.length})</h3>
        <div id="todosList" class="space-y-3">
          ${incompleteTodos.length === 0 
            ? '<p class="text-text-secondary text-center py-8">No tasks yet. Add one to get started! 🚀</p>'
            : incompleteTodos.map(todo => renderTodoItem(todo)).join('')
          }
        </div>
      </div>

      <!-- Completed Todos -->
      ${completedTodos.length > 0 ? `
        <div class="card">
          <h3 class="text-xl font-semibold mb-4 text-text-secondary">Completed (${completedTodos.length})</h3>
          <div id="completedList" class="space-y-3 opacity-60">
            ${completedTodos.map(todo => renderTodoItem(todo)).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Add/Edit Todo Modal -->
    <div id="todoModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="card max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold" id="modalTitle">Add New Todo</h2>
          <button id="closeModal" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form id="todoForm" class="space-y-4">
          <input type="hidden" id="todoId">
          <div>
            <label class="block text-sm font-medium mb-1">Task Title</label>
            <input type="text" id="todoTitle" class="input" placeholder="Complete assignment" required>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea id="todoDescription" class="input" rows="3" placeholder="Optional details..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Priority</label>
              <select id="todoPriority" class="input">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Category</label>
              <select id="todoCategory" class="input">
                <option value="school">School</option>
                <option value="work">Work</option>
                <option value="hustle">Hustle</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Due Date</label>
            <input type="date" id="todoDueDate" class="input">
          </div>
          <div class="flex space-x-3">
            <button type="submit" class="btn btn-primary flex-1">Save Todo</button>
            <button type="button" id="cancelBtn" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  setupTodosListeners(container);
  loadTimeManagementAdvice(container);
}

async function loadTimeManagementAdvice(container) {
  const adviceElement = container.querySelector('#aiAdviceContent');
  if (!adviceElement) return;

  if (appState.aiMessages.timeManagementAdvice) {
    adviceElement.textContent = appState.aiMessages.timeManagementAdvice;
    return;
  }

  try {
    const advice = await generateTimeManagementAdvice(appState.todos, appState.events);
    appState.setAIMessage('timeManagementAdvice', advice);
    adviceElement.textContent = advice;
  } catch (error) {
    console.error('AI Time Management Advice Error:', error);
    adviceElement.textContent = 'Could not generate time management advice.';
  }
}

function renderTodoItem(todo) {
  return `
    <div class="flex items-start space-x-3 p-4 bg-bg-primary/50 rounded-lg hover:bg-bg-primary transition-colors ${todo.completed ? 'opacity-50' : ''}">
      <input type="checkbox" class="mt-1 rounded text-primary-blue focus:ring-primary-blue" ${todo.completed ? 'checked' : ''} data-todo-id="${todo.id}">
      <div class="flex-1">
        <p class="font-medium ${todo.completed ? 'line-through text-text-secondary' : ''}">${todo.title}</p>
        ${todo.description ? `<p class="text-sm text-text-secondary mt-1">${todo.description}</p>` : ''}
        <div class="flex items-center space-x-4 mt-2">
          <span class="badge badge-${todo.priority}">${todo.priority.toUpperCase()}</span>
          ${todo.category ? `<span class="text-xs text-text-secondary">📁 ${todo.category}</span>` : ''}
          ${todo.dueDate ? `<span class="text-xs text-text-secondary">📅 ${getRelativeTime(todo.dueDate)}</span>` : ''}
        </div>
      </div>
      <div class="flex space-x-2">
        <button class="edit-todo text-primary-blue hover:opacity-70" data-todo-id="${todo.id}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button class="delete-todo text-error hover:opacity-70" data-todo-id="${todo.id}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  `;
}

function setupTodosListeners(container) {
  const addTodoBtn = container.querySelector('#addTodoBtn');
  const todoModal = document.getElementById('todoModal'); // Modal is outside container now
  const closeModal = todoModal.querySelector('#closeModal');
  const cancelBtn = todoModal.querySelector('#cancelBtn');
  const todoForm = todoModal.querySelector('#todoForm');

  addTodoBtn?.addEventListener('click', () => {
    todoForm.reset();
    todoModal.querySelector('#todoId').value = '';
    todoModal.querySelector('#modalTitle').textContent = 'Add New Todo';
    todoModal.classList.remove('hidden');
  });

  const closeModalAction = () => todoModal.classList.add('hidden');
  closeModal?.addEventListener('click', closeModalAction);
  cancelBtn?.addEventListener('click', closeModalAction);

  todoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = todoModal.querySelector('#todoId').value;
    const todoData = {
      title: todoModal.querySelector('#todoTitle').value,
      description: todoModal.querySelector('#todoDescription').value,
      priority: todoModal.querySelector('#todoPriority').value,
      category: todoModal.querySelector('#todoCategory').value,
      dueDate: todoModal.querySelector('#todoDueDate').value,
    };

    if (id) {
      appState.updateTodo(id, { ...appState.todos.find(t=>t.id===id), ...todoData });
    } else {
      appState.addTodo({ ...todoData, id: generateId(), completed: false, createdAt: new Date().toISOString() });
    }
    closeModalAction();
  });

  container.addEventListener('click', (e) => {
    const target = e.target;
    const checkbox = target.closest('input[type="checkbox"][data-todo-id]');
    const editBtn = target.closest('.edit-todo');
    const deleteBtn = target.closest('.delete-todo');

    if (checkbox) {
      appState.updateTodo(checkbox.dataset.todoId, { completed: checkbox.checked });
    }

    if (editBtn) {
      const todo = appState.todos.find(t => t.id === editBtn.dataset.todoId);
      if (todo) {
        todoModal.querySelector('#todoId').value = todo.id;
        todoModal.querySelector('#todoTitle').value = todo.title;
        todoModal.querySelector('#todoDescription').value = todo.description || '';
        todoModal.querySelector('#todoPriority').value = todo.priority;
        todoModal.querySelector('#todoCategory').value = todo.category || 'other';
        todoModal.querySelector('#todoDueDate').value = todo.dueDate ? new Date(todo.dueDate).toISOString().substring(0, 10) : '';
        todoModal.querySelector('#modalTitle').textContent = 'Edit Todo';
        todoModal.classList.remove('hidden');
      }
    }

    if (deleteBtn) {
      if (confirm('Delete this todo?')) {
        appState.deleteTodo(deleteBtn.dataset.todoId);
      }
    }
  });

  const filterButtons = container.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const filter = e.target.dataset.filter;
      appState.todoFilter = filter;
      appState.emit('todosChanged', appState.todos); // Re-render todos with new filter
    });
  });

  // Highlight active filter button
  filterButtons.forEach(button => {
    if (button.dataset.filter === appState.todoFilter) {
      button.classList.add('active', 'btn-primary');
      button.classList.remove('btn-secondary');
    } else {
      button.classList.remove('active', 'btn-primary');
      button.classList.add('btn-secondary');
    }
  });
}
