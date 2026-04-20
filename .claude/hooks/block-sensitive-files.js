const d = await Bun.stdin.json();
const toolName = d.tool_name || '';
const input = d.tool_input || {};

const target = toolName === 'Read'
  ? (input.file_path || '')
  : (input.command || '');

const basename = target.replace(/.*[/\\]/, '');

const isSensitiveFile =
  /^\.env($|\.)/.test(basename) ||
  /\.(pem|key)$/i.test(basename) ||
  ['id_rsa', 'id_ed25519', 'secrets.json', 'credentials.json'].includes(basename);

const isSensitiveBashCmd =
  toolName === 'Bash' && /\.env(\s|$|\.)/.test(target);

if (isSensitiveFile || isSensitiveBashCmd) {
  console.log(JSON.stringify({
    continue: false,
    stopReason: `보안 차단: 민감 파일(${basename || target}) 접근이 거부되었습니다.`
  }));
} else {
  console.log(JSON.stringify({ continue: true }));
}
