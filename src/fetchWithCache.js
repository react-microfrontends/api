import { from } from "rxjs";
import { pluck, tap, map } from "rxjs/operators";
import axios from "axios";
import addId from "./addId.js";

const baseURL = "https://swapi.co/api/";

const axiosInstance = axios.create({
  baseURL,
  timeout: 20000
});

const tenMin = 1000 /* ms */ * 60 /* sec */ * 10;

export default function fetchWithCache(url, axiosOptions) {
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
  return from(axiosInstance(options)).pipe(
    pluck("data"),
    map(response => {
      const id = addId(response);
      if (id) {
        return { id, ...response };
      } else if (response.results) {
        return {
          ...response,
          results: response.results.map(result => {
            const id = addId(result);
            return { id, ...result };
          })
        };
      } else {
        return response;
      }
    }),
    tap(response => {
      cache[options.url] = {
        lastPulled: Date.now(),
        value: response
      };
      if (response.results && Array.isArray(response.results)) {
        response.results.forEach(item => {
          if (item.url) {
            const strippedURL = item.url.replace(baseURL, "");
            cache[strippedURL] = {
              lastPulled: Date.now(),
              value: item
            };
          }
        });
      }
    })
  );
}

const cache = {};
