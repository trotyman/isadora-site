const { kv } = require('@vercel/kv');

// Keys para o KV
const KEYS = {
  USERS: 'users',
  PROJECTS: 'projects',
  METADATA: 'metadata'
};

// Funções helper para o banco de dados
async function getUsers() {
  const users = await kv.get(KEYS.USERS);
  return users || [];
}

async function setUsers(users) {
  await kv.set(KEYS.USERS, users);
}

async function getProjects() {
  const projects = await kv.get(KEYS.PROJECTS);
  return projects || [];
}

async function setProjects(projects) {
  await kv.set(KEYS.PROJECTS, projects);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

module.exports = {
  KEYS,
  getUsers,
  setUsers,
  getProjects,
  setProjects,
  generateId,
  generateSlug
};
