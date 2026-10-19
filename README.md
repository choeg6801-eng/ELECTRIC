# BidLens · 해외 전력 입찰서 분석 도구

영문 전력 변압기 입찰서(RFP)에서 핵심 규격 31개 항목을 뽑아 자사 표준품과 비교하고, Bid/No-Bid 판정, 영문 질의서, 제출 준비 목록까지 만들어 주는 웹 도구입니다.

- 만든 사람: 최가은 (KITA 무역 AX마스터 2기 포트폴리오)
- 서버 없이 동작하는 정적 사이트예요. 입력한 문서와 분석 결과는 사용자의 브라우저(localStorage)에만 저장돼요.

## 폴더 구성

```
bidlens/
├─ index.html      ← 사이트 전체 (화면 · 디자인 · 분석 엔진)
├─ photos/         ← 소개 화면 사진 6장 (AI 생성 이미지)
└─ README.md       ← 이 파일
```

`index.html`과 `photos` 폴더는 항상 같은 위치에 두세요. 사진 경로가 `photos/파일명.jpg`로 연결돼 있어요.

## 배포 방법 (셋 중 하나)

### 1. Netlify Drop · 가장 쉬움 (가입 후 1분)
1. https://app.netlify.com/drop 에 접속해 무료 가입 · 로그인
2. 압축을 푼 **bidlens 폴더 통째로** 화면에 끌어다 놓기
3. 몇 초 뒤 `https://임의이름.netlify.app` 주소가 생겨요
4. Site configuration → Change site name 에서 주소를 `bidlens-gaeun` 처럼 바꿀 수 있어요

### 2. GitHub Pages · 포트폴리오에 코드까지 보여주고 싶을 때
1. GitHub에서 새 저장소(예: `bidlens`)를 **Public**으로 만들기
2. Add file → Upload files 로 `index.html`, `README.md`, `photos` 폴더를 올리고 Commit
3. Settings → Pages → Branch를 `main` / `(root)` 로 선택하고 Save
4. 1~2분 뒤 `https://아이디.github.io/bidlens/` 로 열려요

### 3. Vercel
https://vercel.com/new 에서 위 GitHub 저장소를 Import 하면 자동 배포돼요.

## 배포 후 확인할 것
- [ ] 첫 화면 사진과 글꼴이 정상으로 보이는지 (휴대폰에서도)
- [ ] "데모 체험하기" → 샘플 결과 "검토 필요 · 82점"이 나오는지
- [ ] 실제 영문 PDF 하나를 올려 분석되는지 (PDF 읽기 도구를 인터넷에서 불러와요)
- [ ] 엑셀 내보내기 · CSV · 질의서 텍스트 저장이 내려받아지는지
- [ ] 스캔 PDF(글자 없는 PDF)를 올리면 브라우저 글자 인식이 도는지 (첫 실행은 수십 초 걸려요)

## Claude 앱과 일반 웹 배포의 차이
| 기능 | Claude 앱 안 | 일반 웹 배포 |
|---|---|---|
| 규칙 기반 추출 · 판정 · 질의서 | 동작 | 동작 |
| 스캔 PDF 글자 인식 | Claude가 읽음 | 브라우저 OCR(Tesseract) · 정확도 낮음 |
| 빠진 항목 Claude 보완 | 동작 | 버튼이 숨겨져요 |
| 파일 저장 | Claude 저장 창 | 브라우저 기본 내려받기 |

## 인터넷에서 불러오는 것 (차단된 회사망에서는 일부 기능 제한)
- 글꼴: Google Fonts (IBM Plex Sans KR · IBM Plex Mono)
- PDF 읽기: pdf.js 3.11.174 (cdnjs)
- 엑셀 내보내기: SheetJS 0.18.5 (cdnjs)
- 스캔 글자 인식: Tesseract.js 5.1.1 (jsdelivr)

## 참고
- 로그인은 데모용이에요. 실제 계정 인증은 하지 않고, 이름과 이메일은 질의서 서명에만 쓰여요.
- 샘플 입찰서(ABC Power Authority)는 가상의 문서예요.
- 판정 결과는 검토를 돕는 참고 자료예요. 실제 입찰 결정은 원문과 설계팀 검토로 확인하세요.
