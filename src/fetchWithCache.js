import { from } from "rxjs";
import { pluck, tap, map } from "rxjs/operators";
import { fakeAPIFetch } from "./fake-backend/fake-backend.js";

/* assuming you were hitting an actual api you'd do something like this
 * because we're not actually hitting an API now that swapi is down https://github.com/phalt/swapi/issues/147
 * we're going to fake it instead of using axios
 */
// const baseURL = "https://swapi.co/api/";
//
// const axiosInstance = axios.create({
//   baseURL,
//   timeout: 20000
// });

const tenMin = 1000 /* ms */ * 60 /* sec */ * 10;

export function fetchWithCache(url, axiosOptions) {
  const options = { ...axiosOptions, ...{ method: "get" }, ...{ url } };
  if (cache[url] != undefined) {
    const diff = Date.now() - cache[url].lastPulled;
    if (diff < tenMin) {
      return from(
        Promise.resolve().then(() => {
          return cache[url].value;
        })
      );
    }
  }
  return from(fakeAPIFetch(options)).pipe(
    tap((response) => {
      cache[options.url] = {
        lastPulled: Date.now(),
        value: response,
      };
      if (response.results && Array.isArray(response.results)) {
        response.results.forEach((item) => {
          if (item.url) {
            cache[item.url] = {
              lastPulled: Date.now(),
              value: item,
            };
          }
        });
      }
    })
  );
}

const cache = {};
