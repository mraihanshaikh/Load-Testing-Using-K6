import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "1m", target: 100 }, // ramp to 1,000 users in 10s minute
    // { duration: "1m", target: 100 }, // hold for 1 minute (optional but recommended)
  ],
  thresholds: {
    http_req_duration: ["p(95)<10000"],   // 95% of requests under 10 seconds
    "checks{status:200}": ["rate>0.99"],  // 99% success rate required
  },
};

export default function () {
  const url = "https://hc-store.jdwebnship.com";

  const params = {
    headers: {
      "User-Agent": "k6-loadtest/1.0",
      "Accept": "*/*",
    },
    timeout: "10s",
  };

  const res = http.get(url, params);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "content is not empty": (r) => r.body && r.body.length > 0,
  });

  sleep(1);
}
