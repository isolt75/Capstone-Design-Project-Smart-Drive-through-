<template>
  <div class="rotated-app">
    <router-view />
  </div>
</template>
<style>
html,
body,
#app {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* .rotated-app {
  width: 100vh;
  height: 100vw;

  transform: rotate(90deg);

  transform-origin: top left;

  position: absolute;
  top: 0;
  left: 100vw;

  overflow: auto;
} */

:root {
  --primary-color: #ff9f43;
  --bg-base: #fff;
  --bg-list: #eee;
  --bg-shadow: #0000001a;
  --text-primary: #000;
}

body {
  margin: 0;
  background-color: var(--bg-base);
  font-family: Pretendard, sans-serif;
  user-select: none;
}

button {
  border: none;
  cursor: pointer;
  transition: transform 0.1s active;
}

button:active {
  transform: scale(0.97);
}
</style>
