import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const requiredFiles = [
  'package.json',
  'pnpm-lock.yaml',
  'node_modules',
  'src/main.tsx',
  'vite.config.ts',
  '.vscode/settings.json',
  '.vscode/tasks.json',
  'docs/interview-environment.md',
];

let failed = false;
for (const file of requiredFiles) {
  const ok = existsSync(file);
  console.log(`${ok ? 'PASS' : 'FAIL'}  필수 항목: ${file}`);
  if (!ok) failed = true;
}

for (const [name, command] of [
  ['타입 검사', 'pnpm typecheck'],
  ['기본 테스트', 'pnpm test'],
  ['린트', 'pnpm lint'],
]) {
  console.log(`\n[${name}] ${command}`);
  const result = spawnSync(command, {
    cwd: process.cwd(),
    shell: true,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (result.status !== 0) failed = true;
}

console.log(
  failed
    ? '\n면접 환경 점검에 실패했습니다. 위 FAIL 또는 명령 출력을 확인하세요.'
    : '\n면접 환경 점검을 통과했습니다. 네트워크를 끈 상태에서도 pnpm dev를 한 번 확인하세요.',
);
if (failed) process.exitCode = 1;
