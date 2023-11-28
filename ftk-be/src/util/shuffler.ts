/** 
 * DOES NOT shuffle in-place.  
 * You must assign to a new object  
 * */
const shuffleArray = (array: any[]) => {
  let copy = [...array]; // Deep copy
  for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default {
  shuffleArray,
};
