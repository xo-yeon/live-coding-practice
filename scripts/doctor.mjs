import { existsSync } from 'node:fs';
import net from 'node:net';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const checks = [];
const add = (name, ok, detail) => checks.push({ name, ok, detail });

add('Node.js', Number(process.versions.node.split('.')[0]) >= 20, `v${process.versions.node}`);

for (const [name, command] of [
  ['pnpm', 'pnpm --version'],
  ['TypeScript', 'pnpm exec tsc --version'],
  ['Vitest', 'pnpm exec vitest --version'],
]) {
  const result = spawnSync(command, { cwd: process.cwd(), shell: true, encoding: 'utf8' });
  add(name, result.status === 0, (result.stdout || result.stderr).trim().split('\n')[0]);
}

add(
  '의존성',
  existsSync('node_modules'),
  existsSync('node_modules') ? '설치됨' : 'pnpm install 필요',
);

const portAvailable = await new Promise((resolve) => {
  const server = net.createServer();
  server.once('error', () => resolve(false));
  server.once('listening', () => server.close(() => resolve(true)));
  server.listen(5173, '127.0.0.1');
});
add('개발 서버 포트 5173', portAvailable, portAvailable ? '사용 가능' : '이미 사용 중');

for (const check of checks) {
  console.log(`${check.ok ? 'PASS' : 'FAIL'}  ${check.name}: ${check.detail}`);
}

if (checks.some((check) => !check.ok)) process.exitCode = 1;
