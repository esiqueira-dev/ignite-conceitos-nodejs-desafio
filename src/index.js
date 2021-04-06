const express = require("express");
const cors = require("cors");

const { v4: uuidv4, v4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.header("username");

  if (!username) {
    return response.status(400).json({
      error: "Must provide a valid username",
    });
  }

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({
      error: "Username not found",
    });
  }

  request.userId = user.id;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "Username already token",
    });
  }

  const user = {
    id: v4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { userId } = request;

  const todos = users.find((user) => user.id === userId).todos;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { userId } = request;

  const todo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const userIndex = users.findIndex((user) => user.id === userId);

  users[userIndex].todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { userId } = request;
  const { id } = request.params;

  const userIndex = users.findIndex((user) => user.id === userId);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "To Do not found" });
  }

  users[userIndex].todos[todoIndex].title = title;
  users[userIndex].todos[todoIndex].deadline = new Date(deadline);

  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { userId } = request;
  const { id } = request.params;

  const userIndex = users.findIndex((user) => user.id === userId);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "To Do not found" });
  }

  users[userIndex].todos[todoIndex].done = true;

  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { userId } = request;
  const { id } = request.params;

  const userIndex = users.findIndex((user) => user.id === userId);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "To Do not found" });
  }

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;
