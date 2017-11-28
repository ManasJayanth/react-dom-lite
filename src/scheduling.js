const rIC = window.requestIdleCallback;
const cIC = window.cancelIdleCallback;
const now = () => Date.now();

export const Scheduling = {
  rIC,
  cIC,
  now
};
