export function formatCurrency(amount) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-NG', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-NG', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function getRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  
  return formatDate(date);
}

export function isToday(date) {
  const today = new Date();
  const target = new Date(date);
  return today.toDateString() === target.toDateString();
}

export function isThisWeek(date) {
  const today = new Date();
  const target = new Date(date);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return target >= weekStart && target <= weekEnd;
}

export function isThisMonth(date) {
  const today = new Date();
  const target = new Date(date);
  return today.getMonth() === target.getMonth() && 
         today.getFullYear() === target.getFullYear();
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getPriorityColor(priority) {
  switch(priority) {
    case 'high': return 'red';
    case 'medium': return 'yellow';
    case 'low': return 'green';
    default: return 'gray';
  }
}

export function getCategoryIcon(category) {
  const icons = {
    food: '🍔',
    transport: '🚗',
    data: '📱',
    education: '📚',
    entertainment: '🎮',
    health: '🏥',
    shopping: '🛍️',
    bills: '⚡',
    savings: '💰',
    other: '📦'
  };
  return icons[category.toLowerCase()] || '📦';
}
