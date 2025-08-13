import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // ramp up to 100 VUs
    { duration: '1m', target: 200 }, // ramp up to 200 VUs
    { duration: '1m', target: 500 }, // ramp up to 500 VUs
    { duration: '2m', target: 1000 }, // ramp up to 1000 VUs
    { duration: '1m', target: 0 }, // ramp down to 0
  ],
};

export const successCount = new Counter('successful_requests');
export const failureCount = new Counter('failed_requests');
// export const options = {
//   vus: 2000,
//   iterations: 2000,
// };

const randomFromArray = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (length = 5) =>
  Math.floor(Math.random() * Math.pow(10, length)).toString();

function randomDate(start = new Date(2000, 0, 1), end = new Date(2010, 0, 1)) {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString().split('T')[0]; // format: YYYY-MM-DD
}

const firstNames = [
  'John',
  'Grace',
  'Musa',
  'Ada',
  'Tolu',
  'Chinedu',
  'Amaka',
  'Ayodeji',
  'Funke',
];
const lastNames = [
  'Ola',
  'Smith',
  'Okoro',
  'Johnson',
  'Adams',
  'Ngige',
  'Balogun',
  'Adebayo',
  'Ajayi',
];
const genders = ['Male', 'Female'];

export default function () {
  const firstName = randomFromArray(firstNames);
  const lastName = randomFromArray(lastNames);
  const gender = randomFromArray(genders);
  const admissionNumber = `BW/2024-2025/${randomNumber(6)}`;
  const admissionSession = `20${randomNumber(2)}/20${randomNumber(2)}`;
  const dob = randomDate();
  const password = 'Password@1234';
  const confirmPassword = password;
  const phoneNumber = `080${randomNumber(8)}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber(
    3
  )}@example.com`;

  const payload = JSON.stringify({
    first_name: firstName,
    last_name: lastName,
    role: 'student',
    gender: gender,
    admission_number: admissionNumber,
    admission_session: '2024-2025',
    dob: dob,
    password: password,
    confirm_password: confirmPassword,
    phone_number: phoneNumber,
    email: email,
  });

  const accessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdiNzdjYTgyODU3ODA1YzViODBkZGEiLCJ1c2VyRW1haWwiOiJheW9kZWppYWRlYm9sdUBnbWFpbC5jb20iLCJ1c2VyUm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzU0MjM3NDM1LCJleHAiOjE3NTQ0MTAyMzV9.Iqw2OpOHHqRLObjNaD6l1OHl1Cc9BvoOnqfZQQqO140';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  const res = http.post(
    'http://localhost:2500/api/v1/auth/register',
    // 'https://mysingleschoolms-backend.onrender.com/api/v1/auth/register',
    payload,
    { headers, timeout: '120s' }
  );

  const success = check(res, {
    'status was 201': (r) => r.status === 201 || r.status === 200,
  });

  if (success) {
    successCount.add(1);
  } else {
    failureCount.add(1);
  }

  sleep(0.1);
}

export function handleSummary(data: any) {
  return {
    stdout: `
    ✅ Successful requests: ${
      data.metrics.successful_requests?.values?.count || 0
    }
    ❌ Failed requests: ${data.metrics.failed_requests?.values?.count || 0}
    📊 Total requests: ${data.metrics.iterations?.values?.count || 0}
    `,
    'summary.json': JSON.stringify(data, null, 2),
  };
}

// export function handleSummary(data: any) {
//   return {
//     stdout: `\nSUMMARY: ${data.metrics.iterations.values.count} requests sent.\n`,
//     'summary.json': JSON.stringify(data, null, 2),
//   };
// }
