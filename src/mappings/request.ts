type Options = RequestInit & {
  headers?: {
    [key: string]: string;
  };
};

export async function request(
  url: string,
  options?: Options,
  retries: number = 0
): Promise<Response | null> {
  const response = await fetch(url, options);

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 3000; // default to 3 seconds if no retry-after header
      console.log(`Rate limit hit. Retrying after ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return request(url, options, retries + 1);
    } else {
      throw new Error(`Request failed with status ${response.status}`);
    }
  }

  const remainingRequests = response.headers.get("x-ratelimit-remaining");
  const resetTime = response.headers.get("x-ratelimit-reset");

  if (remainingRequests && parseInt(remainingRequests) <= 60 && resetTime) {
    const delay = parseInt(resetTime) * 1000 - Date.now();
    console.log(
      `Approaching rate limit. Waiting for ${delay / 1000} seconds...`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    return request(url, options, retries);
  }

  return response;
}
