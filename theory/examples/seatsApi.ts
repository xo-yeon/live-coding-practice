import { parseSeats } from './seats';

// 수업용 가상 서버. 13석은 실패하며 실제 예약이나 결제는 하지 않습니다.
export async function saveSeats(seats: number): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (!parseSeats(String(seats)).ok) throw new Error('유효하지 않은 좌석 수');
  if (seats === 13) throw new Error('서버가 예약 변경을 거절했습니다.');
  return seats;
}
