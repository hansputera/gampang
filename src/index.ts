/**
 * Say hello!
 * @param {string} name Person name.
 * @return {void}
 */
export const hello = (name: string): void => {
  console.log('Hello', name.normalize('NFKD'));
  return;
};
