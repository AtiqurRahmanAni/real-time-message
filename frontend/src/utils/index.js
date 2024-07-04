export const arrayEquality = (a, b) => {
  a.sort();
  b.sort();

  return a.every((element, idx) => element === b[idx]);
};
