<template>
  <router-view />
</template>
<style>
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
