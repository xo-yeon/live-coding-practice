import { delay, http, HttpResponse } from 'msw';

const account = {
  id: 'training',
  name: '생활비 계좌',
  availableBalance: 2500000,
  dailyLimit: 1000000,
};
const seed = [
  {
    id: 'tr-101',
    recipient: '김하나',
    bank: '샘플은행',
    accountNumber: '12345678901',
    amount: 150000,
    scheduledDate: '2026-10-05',
    status: 'SCHEDULED',
    memo: '생활비',
  },
  {
    id: 'tr-102',
    recipient: '김민수',
    bank: '연습은행',
    accountNumber: '23456789012',
    amount: 800000,
    scheduledDate: '2026-10-10',
    status: 'SCHEDULED',
    memo: '월세',
  },
  {
    id: 'tr-103',
    recipient: '이서연',
    bank: '샘플은행',
    accountNumber: '34567890123',
    amount: 42000,
    scheduledDate: '2026-09-18',
    status: 'COMPLETED',
    memo: '정산',
  },
  {
    id: 'tr-104',
    recipient: '박지훈',
    bank: '연습은행',
    accountNumber: '45678901234',
    amount: 90000,
    scheduledDate: '2026-10-12',
    status: 'CANCELLED',
    memo: '취소된 예약',
  },
  {
    id: 'tr-fail',
    recipient: '최유진',
    bank: '샘플은행',
    accountNumber: '56789012345',
    amount: 30000,
    scheduledDate: '2026-10-15',
    status: 'SCHEDULED',
    memo: '실패 응답 확인용',
  },
];
let transfers = structuredClone(seed);
let sequence = 200;

export function resetTransfers() {
  transfers = structuredClone(seed);
  sequence = 200;
}

const endpoint = '/api/training/transfers';

export const transferHandlers = [
  http.get(endpoint, async ({ request }) => {
    const params = new URL(request.url).searchParams;
    const keyword = params.get('keyword') ?? '';
    const status = params.get('status') ?? 'ALL';
    const items = transfers.filter(
      (item) => item.recipient.includes(keyword) && (status === 'ALL' || item.status === status),
    );
    await delay(keyword.length === 1 ? 900 : 120);
    if (keyword === '오류')
      return HttpResponse.json({ message: '잠시 후 다시 검색해주세요.' }, { status: 503 });
    return HttpResponse.json({ account, items });
  }),
  http.post(endpoint, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    await delay(550);
    if (
      typeof body.amount !== 'number' ||
      !Number.isSafeInteger(body.amount) ||
      body.amount <= 0 ||
      body.amount > account.availableBalance ||
      body.amount > account.dailyLimit
    ) {
      return HttpResponse.json(
        { message: '허용 범위의 정수 원화 금액만 예약할 수 있습니다.' },
        { status: 400 },
      );
    }
    if (
      typeof body.recipient !== 'string' ||
      !body.recipient.trim() ||
      typeof body.bank !== 'string' ||
      !body.bank.trim() ||
      typeof body.accountNumber !== 'string' ||
      !/^\d{8,14}$/.test(body.accountNumber) ||
      typeof body.scheduledDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.scheduledDate)
    ) {
      return HttpResponse.json(
        { message: '받는 분, 은행, 계좌번호, 예약일을 확인해주세요.' },
        { status: 400 },
      );
    }
    const item = {
      id: `tr-${++sequence}`,
      recipient: body.recipient,
      bank: body.bank,
      accountNumber: body.accountNumber,
      amount: body.amount,
      scheduledDate: body.scheduledDate,
      status: 'SCHEDULED',
      memo: typeof body.memo === 'string' ? body.memo : '',
    };
    transfers = [item, ...transfers];
    return HttpResponse.json(item, { status: 201 });
  }),
  http.post(`${endpoint}/:id/cancel`, async ({ params }) => {
    await delay(450);
    if (params.id === 'tr-fail') {
      return HttpResponse.json(
        { message: '은행 응답 지연으로 취소에 실패했습니다.' },
        { status: 503 },
      );
    }
    const item = transfers.find((entry) => entry.id === params.id);
    if (!item) return HttpResponse.json({ message: '예약을 찾을 수 없습니다.' }, { status: 404 });
    if (item.status !== 'SCHEDULED') {
      return HttpResponse.json({ message: '예약 상태에서만 취소할 수 있습니다.' }, { status: 409 });
    }
    item.status = 'CANCELLED';
    return HttpResponse.json(item);
  }),
];
