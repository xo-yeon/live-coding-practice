export const formatWon = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;

export const formatPercent = (value: number) => `${value.toFixed(2)}%`;
