#!/bin/bash

# jq 경로 (WinGet에 설치된 경우)
JQ="/c/Users/masocampus/AppData/Local/Microsoft/WinGet/Links/jq.exe"

# jq 미설치 방어 (command 또는 절대경로 모두 확인)
if ! command -v jq >/dev/null 2>&1 && [ ! -f "$JQ" ]; then
  exit 0
fi

# 사용 가능한 jq 결정
if command -v jq >/dev/null 2>&1; then
  JQ="jq"
fi

# stdin에서 파일 경로 추출
file=$("$JQ" -r '.tool_input.file_path // empty' 2>/dev/null)

# 빈 입력 방어
[ -z "$file" ] && exit 0

# 경로 필터링: /src/ 또는 \src\ 포함
if [[ ! "$file" =~ /src/|\\\\src\\ ]]; then
  exit 0
fi

# 확장자 필터링: .ts 또는 .tsx
if [[ ! "$file" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

# 테스트 파일 제외: .test.ts 또는 .test.tsx로 끝나지 않음
if [[ "$file" =~ \.test\.(ts|tsx)$ ]]; then
  exit 0
fi

# 테스트 파일 경로 계산
base="${file%.*}"  # 확장자 제거
test_file_1="${base}.test.ts"
test_file_2="${base}.test.tsx"

# 테스트 파일 존재 확인
if [ -f "$test_file_1" ] || [ -f "$test_file_2" ]; then
  exit 0
fi

# TDD 리마인더 출력 (stderr로)
{
  echo "⚠ TDD 리마인더: 테스트 파일이 없습니다 → $file"
  echo "  ~/.claude/rules/tdd.md 의 RED-GREEN-REFACTOR 사이클을 확인하세요."
  echo "  테스트 전에 프로덕션 코드를 먼저 작성했다면 '삭제 강제 규칙'을 기억하세요."
} >&2

exit 0
