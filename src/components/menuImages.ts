export const menuImages: Record<number, string> = {
  1: '/images/americano.png',
  2: '/images/coldBrew.png',
  3: '/images/caramelMacchiato.png',
  4: '/images/cappucchino.png',
  5: '/images/cafeMocha.png',
  6: '/images/cafeLatte.png',
  7: '/images/javaChip.png',
  8: '/images/milkShake.png',
  9: '/images/strawberryYogurt.png',
  10: '/images/mangoYogurt.png',
  11: '/images/lemodade.png',
  12: '/images/orangeJuice.png',
  13: '/images/limeMohito.png',
  14: '/images/greentea.png',
  15: '/images/grapefruitBlacktea.png',
  16: '/images/icetea.png',
  17: '/images/matcha.png',
  18: '/images/choco.png',
  19: '/images/milk.png',
};

export const getMenuImage = (id: number) =>
  menuImages[id] || '/images/default.png';
