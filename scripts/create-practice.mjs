import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function readTitle(argv) {
  const index = argv.indexOf('--title');
  if (index === -1 || !argv[index + 1]) {
    throw new Error('사용법: pnpm practice:new --title "campaign-filter"');
  }

  const title = argv[index + 1]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '');

  if (!title) throw new Error('문제명에는 문자나 숫자가 필요합니다.');
  return title;
}

function localDate() {
  if (process.env.PRACTICE_DATE) return process.env.PRACTICE_DATE;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function nextSequence(directory) {
  if (!existsSync(directory)) return 1;
  const names = await readdir(directory, { withFileTypes: true });
  const sequences = names
    .filter((entry) => entry.isDirectory())
    .map((entry) => Number(entry.name.match(/^(\d+)-/)?.[1] ?? 0));
  return Math.max(0, ...sequences) + 1;
}

const root = process.cwd();
const title = readTitle(process.argv.slice(2));
const date = localDate();
const practiceDateDirectory = path.join(root, 'practice', date);
const sequence = await nextSequence(practiceDateDirectory);
const folderName = `${String(sequence).padStart(2, '0')}-${title}`;
const challengeDirectory = path.join(practiceDateDirectory, folderName);
const interviewerDirectory = path.join(root, '.interviewer', date, folderName);
const templateDirectory = path.join(root, 'templates', 'challenge');

if (existsSync(challengeDirectory)) throw new Error(`${challengeDirectory}가 이미 존재합니다.`);

await mkdir(challengeDirectory, { recursive: true });
await cp(path.join(templateDirectory, 'before'), path.join(challengeDirectory, 'before'), {
  recursive: true,
});
await cp(path.join(challengeDirectory, 'before'), path.join(challengeDirectory, 'working'), {
  recursive: true,
});
await cp(path.join(templateDirectory, 'tests'), path.join(challengeDirectory, 'tests'), {
  recursive: true,
});
await writeFile(
  path.join(challengeDirectory, 'problem.md'),
  `# ${title}\n\n- 난이도: 작성 필요\n- 제한 시간: 작성 필요\n- 상황: AI가 문제 상황을 작성합니다.\n- 요구사항: 면접 시작 전 공개 범위를 확인합니다.\n`,
);
await writeFile(
  path.join(challengeDirectory, 'notes.md'),
  '# 분석 노트\n\n## 확인한 문제\n\n## 우선순위와 근거\n\n## 검증 결과\n',
);
await writeFile(
  path.join(challengeDirectory, 'review.md'),
  '# 면접 종료 후 작성\n\n이 파일은 채점 요청 후 AI가 작성합니다.\n',
);

await mkdir(path.join(interviewerDirectory, 'reference-solution'), { recursive: true });
await writeFile(
  path.join(interviewerDirectory, 'issue-list.md'),
  '# 비공개 문제 목록\n\n정답 공개 전에는 지원자에게 공개하거나 인용하지 않습니다.\n',
);
await writeFile(path.join(interviewerDirectory, 'follow-up-questions.md'), '# 비공개 꼬리질문\n');
await writeFile(path.join(interviewerDirectory, 'evaluation.md'), '# 비공개 채점 기준\n');

console.log(`생성 완료: practice/${date}/${folderName}`);
console.log(`원본: practice/${date}/${folderName}/before`);
console.log(`수정할 곳: practice/${date}/${folderName}/working`);
console.log('after 폴더는 면접 종료 후 요청할 때 생성하세요.');
