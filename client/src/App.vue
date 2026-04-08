<template>
  <div class="app">
    <header class="header">
      <h1>Location selector (TypeScript)</h1>
      <nav class="nav">
        <RouterLink to="/">Map</RouterLink>
        <RouterLink to="/history">Saved locations</RouterLink>
      </nav>
    </header>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: #1a1a1a;
  background: #f4f5f7;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: #0f172a;
  color: #f8fafc;
}

.header h1 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav a {
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
}

.nav a.router-link-active {
  color: #38bdf8;
}

.main {
  flex: 1;
  padding: 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}
</style>
