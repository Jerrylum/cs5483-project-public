export const requestDiff = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Range: 'bytes=0-4095', // Request first 4KB
    },
  });

  return await response.text();
};
