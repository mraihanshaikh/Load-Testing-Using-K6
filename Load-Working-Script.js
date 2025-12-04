import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 50 }, 
    { duration: "3m", target: 50 },  
    { duration: "1m", target: 0 },   
  ],
  thresholds: {
    'http_req_duration{api:"rate_calc"}': ['p(95)<1000'],
    'http_req_failed{api:"rate_calc"}': ['rate<0.01'],
  },
};

const BASE_URL = ""; 

const LOGIN_EMAIL = "";
const LOGIN_PASSWORD = "";

// 🔒 encrypted request (same as you provided)
const encryptedBody =
  "enter encryptedBody payload";

// ⭐ NEW FUNCTION (added)
function failIfSlow(res, limitMs, label) {
  if (res && res.timings && res.timings.duration > limitMs) {
    console.error(
      `❌ ${label} FAILED – Took ${res.timings.duration}ms (Limit: ${limitMs}ms)`
    );
  }
}

export default function () {
  // 1️⃣ Login → get CSRF + cookies
  const xsrfToken = loginAndGetXsrfToken();

  // 2️⃣ Orders List Page
  const ordersPage = http.get(`${BASE_URL}/orders-list`);
  failIfSlow(ordersPage, 1000, "Orders List Page");

  check(ordersPage, {
    "orders list 200": (r) => r.status === 200,
  });

  const tokenMatch = ordersPage.body.match(/name="_token"\s+value="([^"]+)"/);
  const ordersToken = tokenMatch ? tokenMatch[1] : null;

  check(ordersToken, {
    "found orders _token": (t) => !!t,
  });

  // 3️⃣ Approved List filter
  const approvedPayload = buildApprovedPayload(ordersToken);

  const approvedRes = http.post(
    `${BASE_URL}/orders-list/order-list/fetch-record`,
    approvedPayload,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json, text/javascript, */*; q=0.01",
      },
    }
  );

  failIfSlow(approvedRes, 1000, "Approved List API");

  check(approvedRes, {
    "approved list 200": (r) => r.status === 200,
  });

  // 4️⃣ Rate Calculation API (MAIN API)
  const rateHeaders = {
    "Content-Type": "application/json",
    "X-XSRF-TOKEN": xsrfToken,
  };

  const rateRes = http.post(
    `${BASE_URL}/rate-calculation`,
    encryptedBody,
    {
      headers: rateHeaders,
      tags: { api: "rate_calc" },
    }
  );

  failIfSlow(rateRes, 1000, "Rate Calculation API");

  check(rateRes, {
    "rate calc 200/201/302": (r) =>
      r.status === 200 || r.status === 201 || r.status === 302,
  });

  sleep(1);
}

// 🔐 Login Flow
function loginAndGetXsrfToken() {
  const loginPage = http.get(`${BASE_URL}/login`);
  failIfSlow(loginPage, 1000, "Login Page");

  check(loginPage, {
    "login page 200": (r) => r.status === 200,
  });

  const formTokenMatch = loginPage.body.match(
    /name="_token"\s+value="([^"]+)"/
  );
  const formToken = formTokenMatch ? formTokenMatch[1] : null;

  check(formToken, {
    "found login _token": (t) => !!t,
  });

  let xsrfCookie = null;
  if (
    loginPage.cookies["XSRF-TOKEN"] &&
    loginPage.cookies["XSRF-TOKEN"][0]
  ) {
    xsrfCookie = decodeURIComponent(
      loginPage.cookies["XSRF-TOKEN"][0].value
    );
  }

  const payload = {
    _token: formToken,
    email: LOGIN_EMAIL,
    password: LOGIN_PASSWORD,
  };

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const loginRes = http.post(`${BASE_URL}/login`, payload, {
    headers,
  });

  failIfSlow(loginRes, 1000, "Login POST");

  check(loginRes, {
    "login 200/302": (r) => r.status === 200 || r.status === 302,
  });

  if (
    !xsrfCookie &&
    loginRes.cookies["XSRF-TOKEN"] &&
    loginRes.cookies["XSRF-TOKEN"][0]
  ) {
    xsrfCookie = decodeURIComponent(
      loginRes.cookies["XSRF-TOKEN"][0].value
    );
  }

  return xsrfCookie;
}

// 🧾 Approved list payload
function buildApprovedPayload(csrfToken) {
  return {
    draw: "1",

    "columns[0][data]": "order_id",
    "columns[0][name]": "",
    "columns[0][searchable]": "false",
    "columns[0][orderable]": "false",
    "columns[0][search][value]": "",
    "columns[0][search][regex]": "false",

    "columns[1][data]": "sr_no",
    "columns[1][name]": "",
    "columns[1][searchable]": "true",
    "columns[1][orderable]": "false",
    "columns[1][search][value]": "",
    "columns[1][search][regex]": "false",

    "columns[2][data]": "order_date",
    "columns[2][name]": "",
    "columns[2][searchable]": "true",
    "columns[2][orderable]": "true",
    "columns[2][search][value]": "",
    "columns[2][search][regex]": "false",

    "columns[3][data]": "media",
    "columns[3][name]": "",
    "columns[3][searchable]": "true",
    "columns[3][orderable]": "false",
    "columns[3][search][value]": "",
    "columns[3][search][regex]": "false",

    "columns[4][data]": "order_detail",
    "columns[4][name]": "",
    "columns[4][searchable]": "true",
    "columns[4][orderable]": "false",
    "columns[4][search][value]": "",
    "columns[4][search][regex]": "false",

    "columns[5][data]": "customer_detail",
    "columns[5][name]": "",
    "columns[5][searchable]": "true",
    "columns[5][orderable]": "false",
    "columns[5][search][value]": "",
    "columns[5][search][regex]": "false",

    "columns[6][data]": "action",
    "columns[6][name]": "",
    "columns[6][searchable]": "false",
    "columns[6][orderable]": "false",
    "columns[6][search][value]": "",
    "columns[6][search][regex]": "false",

    start: "0",
    length: "20",
    "search[value]": "",
    "search[regex]": "false",

    _token: csrfToken,
    date_filter: "20/10/2025 - 18/11/2025",
    payment_method_filter: "all",
    type: "approved-by-retailer",
  };
}
