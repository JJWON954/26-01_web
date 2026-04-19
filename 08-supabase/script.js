const SUPABASE_URL = "https://zvmddevbdxsrcxvrzoiz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bWRkZXZiZHhzcmN4dnJ6b2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTA5OTYsImV4cCI6MjA5MjA4Njk5Nn0.eB-CJfCYHgKwZcbPCSF5l4NEBiAjPLLEDHT9gNgfTAE";

const { createClient } = supabase;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");

function renderTodos(todos) {
  const todoItems = todos
    .map(function (todo) {
      return `
        <li>
          <strong>${todo.content}</strong>
          <div>완료 여부: ${todo.is_done ? "완료" : "진행 중"}</div>
          <div>생성일: ${todo.created_at}</div>
        </li>
      `;
    })
    .join("");

  todoList.innerHTML = todoItems;
}

async function loadTodos() {
  const { data, error } = await client
    .from("todo")
    .select("id, content, is_done, created_at");

  if (error) {
    console.error("에러 발생:", error);
    return;
  }

  console.log("조회된 데이터:", data);
  renderTodos(data);
}

  async function addTodo(event) {
  event.preventDefault();

  const content = todoInput.value.trim();

  if (!content) {
    alert("할 일을 입력해주세요.");
    return;
  }

  const {error} = await client
    .from("todo")
    .insert([
      {
        content: content,
        is_done: false
      }
    ]);

  if (error) {
    console.error("추가 실패:", error);
    return;
  }

  todoInput.value = "";
  await loadTodos();
}

todoForm.addEventListener("submit", addTodo);

document.addEventListener("DOMContentLoaded", async () => {
  await loadTodos();
})
