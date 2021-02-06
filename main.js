const getTodoItemTemplate = ({ id, text, done }) => `
  <div id="todo__item" data-id="${id}" data-done="${done}">
    <div id="todo__check-icon" class="done">
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
      </svg>
    </div>
    <p id="todo__text">${text}</p>
    <div id="todo__edit-icon" class="icon">
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        ></path>
      </svg>
    </div>
    <div id="todo__delete-icon" class="icon">
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
      </svg>
    </div>
  </div>
`;

class Todo {
  constructor() {
    this.attachCreateTodoEvent();

    this.syncDate();

    this.leftTodosElement = document.getElementById('app__left-todos');
    this.todoContainer = document.getElementById('todo__wrapper');
    this.todos = JSON.parse(localStorage.getItem('todos')) ?? [];

    this.render();

    window.addEventListener('beforeunload', () => {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    });
  }

  attachCreateTodoEvent() {
    const createButtonElement = document.getElementById('todo__create-button');

    createButtonElement.previousElementSibling.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        this.todos = this.todos.concat({
          id: this.todos.length ? this.todos[this.todos.length - 1].id + 1 : 1,
          text: e.target.value,
          done: false,
        });

        createButtonElement.classList.remove('clicked');
        createButtonElement.previousElementSibling.classList.add('hidden');
        createButtonElement.previousElementSibling.value = '';

        this.render();
      }
    });

    createButtonElement.addEventListener('click', (e) => {
      if (createButtonElement.previousElementSibling.value) {
        createButtonElement.previousElementSibling.value = '';
      }

      e.currentTarget.classList.toggle('clicked');
      createButtonElement.previousElementSibling.classList.toggle('hidden');
      createButtonElement.previousElementSibling.focus();
    });
  }

  syncDate() {
    const dateElement = document.getElementById('app__date');
    const dayElement = document.getElementById('app__day');

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDay();

    const days = ['일', '월', '화', '수', '목', '금', '토'];

    dateElement.innerHTML = `${year}년 ${month + 1}월 ${day}일`;
    dayElement.innerHTML = `${days[day]}요일`;
  }

  render() {
    this.todoContainer.innerHTML = '';
    this.todos.map((todo) => {
      this.todoContainer.insertAdjacentHTML('beforeend', getTodoItemTemplate(todo));

      const todoItemSelector = `#todo__item[data-id="${todo.id}"] `;
      const index = this.todos.findIndex(({ id }) => id === todo.id);

      document.querySelector(`${todoItemSelector} > #todo__check-icon`).addEventListener('click', () => {
        this.todos[index].done = !this.todos[index].done;
        this.render();
      });

      document.querySelector(`${todoItemSelector} > #todo__delete-icon`).addEventListener('click', () => {
        this.todos.splice(index, 1);
        this.render();
      });

      document.querySelector(`${todoItemSelector} > #todo__edit-icon`).addEventListener('click', () => {
        const textElement = document.querySelector(todoItemSelector).children[1];

        textElement.insertAdjacentHTML('beforeBegin', `<input type="text" value="${todo.text}" />`);
        textElement.previousElementSibling.focus();

        const focusElement = textElement.previousElementSibling;

        if (navigator.appName == 'Microsoft Internet Explorer') {
          const inputRange = focusElement.createTextRange();

          inputRange.moveStart('character', todo.text.length);
          inputRange.select();
        } else {
          focusElement.selectionStart = todo.text.length;
        }

        focusElement.addEventListener('focusout', () => {
          this.todos[index].text = focusElement.value;
          this.render();
        });

        textElement.remove();
      });
    });

    const leftTodosCount = this.todos.filter(({ done }) => !done).length;

    this.leftTodosElement.innerText = `할 일 ${leftTodosCount}개 남음`;
  }
}

class App {
  constructor() {
    this.iphone = document.getElementById('iphone');
    this.clock = document.getElementById('iphone__clock');

    this.resize();
    this.runClock();

    window.addEventListener('resize', this.resize);

    new Todo();
  }

  resize() {
    const width = window.innerWidth;

    if (width > 500) {
      this.iphone.style.transform = `scale(1)`;
      return;
    }

    this.iphone.style.transform = `scale(${(width * 0.9) / 450})`;
  }

  runClock() {
    const date = new Date();
    const seconds = date.getSeconds();

    function syncTime() {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      this.clock.innerText = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    syncTime.bind(this)();

    setTimeout(() => {
      syncTime.bind(this)();

      setInterval(() => {
        syncTime.bind(this)();
      }, 60000);
    }, (60 - seconds) * 1000);
  }
}

new App();
