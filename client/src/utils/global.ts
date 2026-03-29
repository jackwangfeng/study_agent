export const initGlobalData = {
  navBarHeight: 0,
  statusBarHeight: 0,
};

export function setGlobalData(key: string, value: any) {
  (initGlobalData as any)[key] = value;
}

export function getGlobalData(key: string) {
  return (initGlobalData as any)[key];
}
