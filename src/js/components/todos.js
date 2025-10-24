import { appState } from '../state/appState.js';
import { generateId, formatDate, getRelativeTime } from '../utils/helpers.js';
import { prioritizeTodos } from '../services/bedrock.js';
import { renderDashboard } from './dashboard.js';

export function renderTodos(container) {
  const incompleteTodos = appState.todos.filter(t => !t.completed);
  const completedTodos = appState.todos.filter(t => t.completed);

  container.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4 flex items-center justify-between">
          <button id="backBtn" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-gradient">My Todos</h1>
          <button id="addTodoBtn" class="btn btn-primary text-sm">+ Add Todo</button>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Filters -->
        <div class="card mb-6">
          <div class="flex flex-wrap gap-2 mb-4">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="today">Today</button>
            <button class="filter-btn" data-filter="week">This Week</button>
            <button class="filter-btn" data-filter="month">This Month</button>
            <button class="filter-btn" data-filter="high">High Priority</button>
          </div>
          <button id="aiSortBtn" class="btn btn-secondary text-sm w-full">
            🤖 AI Smart Sort
          </button>
          <div id="aiSuggestion" class="hidden mt-4 p-4 bg-primary-50 rounded-lg">
            <p class="text-sm text-gray-700"></p>
          </div>
        </div>

        <!-- Incomplete Todos -->
        <div class="card mb-6">
          <h2 class="text-xl font-semibold mb-4">To Do (${incompleteTodos.length})</h2>
          <div id="todosList" class="space-y-3">
            ${incompleteTodos.length === 0 
              ? '<p class="text-gray-500 text-center py-8">No tasks yet. Add one to get started! 🚀</p>'
              : incompleteTodos.map(todo => renderTodoItem(todo)).join('')
            }
          </div>
        </div>

        <!-- Completed Todos -->
        ${completedTodos.length > 0 ? `
          <div class="card">
            <h2 class="text-xl font-semibold mb-4 text-gray-500">Completed (${completedTodos.length})</h2>
            <div id="completedList" class="space-y-3 opacity-60">
              ${completedTodos.map(todo => renderTodoItem(todo)).join('')}
            </div>
          </div>
        ` : ''}
      </main>
    </div>

    <!-- Add/Edit Todo Modal -->
    <div id="todoModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="card max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold" id="modalTitle">Add New Todo</h2>
          <button id="closeModal" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form id="todoForm" class="space-y-4">
          <input type="hidden" id="todoId">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input type="text" id="todoTitle" class="input" placeholder="Complete assignment" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="todoDescription" class="input" rows="3" placeholder="Optional details..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select id="todoPriority" class="input">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
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
}

function renderTodoItem(todo) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return `
    <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${todo.completed ? 'opacity-50' : ''}">
      <input type="checkbox" class="mt-1 rounded" ${todo.completed ? 'checked' : ''} data-todo-id="${todo.id}">
      <div class="flex-1">
        <p class="font-medium ${todo.completed ? 'line-through text-gray-500' : ''}">${todo.title}</p>
        ${todo.description ? `<p class="text-sm text-gray-600 mt-1">${todo.description}</p>` : ''}
        <div class="flex items-center space-x-2 mt-2">
          <span class="badge ${priorityColors[todo.priority]}">${todo.priority.toUpperCase()}</span>
          ${todo.category ? `<span class="text-xs text-gray-500">📁 ${todo.category}</span>` : ''}
          ${todo.dueDate ? `<span class="text-xs text-gray-500">📅 ${getRelativeTime(todo.dueDate)}</span>` : ''}
        </div>
      </div>
      <div class="flex space-x-2">
        <button class="edit-todo text-primary-600 hover:text-primary-700" data-todo-id="${todo.id}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button class="delete-todo text-red-600 hover:text-red-700" data-todo-id="${todo.id}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  `;
}

function setupTodosListeners(container) {
  const backBtn = container.querySelector('#backBtn');
  backBtn?.addEventListener('click', () => {
    appState.setView('dashboard');
  });

  const addTodoBtn = container.querySelector('#addTodoBtn');
  const todoModal = container.querySelector('#todoModal');
  const closeModal = container.querySelector('#closeModal');
  const cancelBtn = container.querySelector('#cancelBtn');
  const todoForm = container.querySelector('#todoForm');

  addTodoBtn?.addEventListener('click', () => {
    todoForm.reset();
    container.querySelector('#todoId').value = '';
    container.querySelector('#modalTitle').textContent = 'Add New Todo';
    todoModal.classList.remove('hidden');
  });

  closeModal?.addEventListener('click', () => {
    todoModal.classList.add('hidden');
  });

  cancelBtn?.addEventListener('click', () => {
    todoModal.classList.add('hidden');
  });

  todoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = container.querySelector('#todoId').value;
    const todoData = {
      title: container.querySelector('#todoTitle').value,
      description: container.querySelector('#todoDescription').value,
      priority: container.querySelector('#todoPriority').value,
      category: container.querySelector('#todoCategory').value,
      dueDate: container.querySelector('#todoDueDate').value,
      completed: false,
      createdAt: new Date().toISOString()
    };

    if (id) {
      appState.updateTodo(id, todoData);
    } else {
      appState.addTodo({ ...todoData, id: generateId() });
    }

    todoModal.classList.add('hidden');
    appState.setView('todos');
  });

  const checkboxes = container.querySelectorAll('input[type="checkbox"][data-todo-id]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      appState.updateTodo(e.target.dataset.todoId, { completed: e.target.checked });
      appState.setView('todos');
    });
  });

  const editBtns = container.querySelectorAll('.edit-todo');
  editBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const todo = appState.todos.find(t => t.id === btn.dataset.todoId);
      if (todo) {
        container.querySelector('#todoId').value = todo.id;
        container.querySelector('#todoTitle').value = todo.title;
        container.querySelector('#todoDescription').value = todo.description || '';
        container.querySelector('#todoPriority').value = todo.priority;
        container.querySelector('#todoCategory').value = todo.category || 'other';
        container.querySelector('#todoDueDate').value = todo.dueDate || '';
        container.querySelector('#modalTitle').textContent = 'Edit Todo';
        todoModal.classList.remove('hidden');
      }
    });
  });

  const deleteBtns = container.querySelectorAll('.delete-todo');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this todo?')) {
        appState.deleteTodo(btn.dataset.todoId);
        appState.setView('todos');
      }
    });
  });

  const aiSortBtn = container.querySelector('#aiSortBtn');
  const aiSuggestion = container.querySelector('#aiSuggestion');
  aiSortBtn?.addEventListener('click', async () => {
    aiSortBtn.disabled = true;
    aiSortBtn.textContent = '🤖 Analyzing...';
    
    const suggestion = await prioritizeTodos(appState.todos.filter(t => !t.completed));
    aiSuggestion.querySelector('p').textContent = suggestion;
    aiSuggestion.classList.remove('hidden');
    
    aiSortBtn.disabled = false;
    aiSortBtn.textContent = '🤖 AI Smart Sort';
  });
}
