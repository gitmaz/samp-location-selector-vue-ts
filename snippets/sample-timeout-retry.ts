function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );

  return Promise.race([promise, timeout]);
}

//usage:
await withTimeout(externalApi.call(), 3000);







async function callWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await withTimeout(fn(), 3000);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2 ** i * 100));
    }
  }
}

//usage:

await callWithRetry(() => externalApi.call());




//--- simpler syntax but better  ---------------------------------

async function fetchWithTimeout(url, options, timeoutMs) {
  //using  fetch 
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 3000); // 3 seconds

  try {
    const res = await fetch('https://api.example.com/data', {
      signal: controller.signal
    });

    const data = await res.json();
    return data;

  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('External API timeout');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

//fetch with retries

async function fetchWithRetry(url, options, timeoutMs, retries = 3) {
  const backoffDelay = 100; // initial backoff delay in ms

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs);
      return res;
    } catch (err) {
      await sleep(backoffDelay);
    }
  }

}
/*

AbortController
Cancels the actual request ✅
Frees resources ✅
Promise.race
Promise.race([fetch(...), timeoutPromise])
Only stops waiting ❌
Request still runs in background ❌
Can waste:
sockets
memory
rate limits
*/

// using  axios 
import axios from 'axios';

const res = await axios.get('https://api.example.com/data', {
  timeout: 3000
});
