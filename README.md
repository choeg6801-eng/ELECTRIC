# BidLens · 해외 전력 입찰서 분석 도구

영문 전력 변압기 입찰서(RFP)에서 핵심 규격 31개 항목을 뽑아 자사 표준품과 비교하고, Bid/No-Bid 판정, 영문 질의서, 제출 준비 목록까지 만들어 주는 웹 도구입니다. 세계은행 · EU 공공조달에 올라온 실제 해외 전력 입찰 공고도 모아 보여줘요.

- 만든 사람: 최가은 (KITA 무역 AX마스터 2기 포트폴리오)
- 정적 사이트예요. 입력한 문서와 분석 결과는 사용자의 브라우저(localStorage)에만 저장돼요.

## 폴더 구성

```
bidlens/
├─ index.html                         ← 사이트 전체 (화면 · 디자인 · 분석 엔진)
├─ photos/                            ← 소개 화면 사진 6장 (AI 생성 이미지)
├─ tenders.json                       ← 해외 공고 목록 (GitHub Actions가 자동으로 채움)
├─ scripts/fetch-tenders.mjs          ← 공고 수집 스크립트
├─ .github/workflows/update-tenders.yml  ← 6시간마다 수집을 실행하는 설정
└─ README.md
```

> `.github` 폴더는 이름이 점(.)으로 시작해서 Windows · Mac에서 숨김 폴더로 보일 수 있어요. 지우지 말고 함께 올려 주세요.

## 추천 배포: GitHub Pages (해외 공고 자동 갱신까지)

해외 공고가 6시간마다 자동으로 새로 고쳐지려면 GitHub에 올려야 해요. 무료예요.

1. https://github.com 가입 · 로그인 → 오른쪽 위 **+ → New repository**
   - Repository name: `bidlens` · **Public** 선택 → Create repository
2. 새 저장소 화면에서 **uploading an existing file** 클릭
   - 압축을 푼 `bidlens` 폴더 **안의 내용 전부**(index.html, photos, scripts, tenders.json, README.md)를 끌어다 놓고 **Commit changes**
3. `.github` 숨김 폴더는 웹 업로드에서 빠질 수 있어요. 빠졌다면:
   - 저장소에서 **Add file → Create new file**
   - 파일 이름 칸에 `.github/workflows/update-tenders.yml` 입력
   - 압축 파일 안의 같은 파일 내용을 그대로 복사해 붙여넣고 **Commit changes**
4. **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save
5. **Actions 탭**을 눌러 "I understand my workflows…" 같은 초록 버튼이 보이면 눌러서 켜기
6. 왼쪽 목록에서 **Update tenders** → 오른쪽 **Run workflow** 버튼 → 펼쳐진 상자의 **초록색 Run workflow**를 한 번 더 눌러 첫 수집 실행 (1분 정도)
7. 실행 기록에 초록 체크가 뜨고 2~3분 뒤 `https://아이디.github.io/bidlens/` 에서 앱 → **해외 공고** 메뉴에 공고가 보이면 끝이에요. 이후 6시간마다 자동으로 갱신돼요.

### 안 될 때
| 증상 | 해결 |
|---|---|
| Actions 실행 기록에 빨간 X, 로그에 `Permission denied` · `403` | **Settings → Actions → General** → 맨 아래 **Workflow permissions**를 `Read and write permissions`로 바꾸고 Save → 6번 다시 실행 |
| Actions 탭에 Update tenders가 없음 | `.github/workflows/update-tenders.yml` 파일이 빠진 거예요. 위 3번대로 직접 만들어 주세요 |
| 해외 공고 화면에 "공고 파일이 아직 비어 있어요" | Actions 첫 실행 전이에요. 위 6번(Run workflow)을 실행하세요 |
| 실행은 초록인데 공고가 안 보임 | 저장소에 `tenders.json`이 생겼는지 확인 · 사이트는 1~3분 늦게 반영돼요 · 브라우저 새로고침 |
| 해외 공고 화면에 "공고 파일이 N일 전 것이에요" | 자동 실행이 멈춘 거예요. GitHub은 60일 동안 저장소 활동이 없으면 예약 실행을 끄니, Actions 탭에서 다시 켜고 Run workflow |
| EU TED가 "오류"로 표시 | Actions 실행 기록 → Fetch tenders 단계의 로그를 복사해 문의해 주세요 (세계은행 공고는 그대로 보여요) |

## 간단 배포: Netlify Drop

1. https://app.netlify.com/drop 에서 가입 후 `bidlens` 폴더를 끌어다 놓기
2. 분석 기능은 모두 동작해요. **해외 공고는 자동 갱신되지 않아요.** 브라우저가 세계은행에 직접 접속을 시도하고, 막히면 공식 조달 사이트 바로가기를 보여줘요.

## 배포 후 확인할 것
- [ ] 첫 화면 사진과 글꼴이 정상으로 보이는지 (휴대폰에서도)
- [ ] 첫 화면 "데모 체험하기" → 바로 샘플 결과 "검토 필요 · 82점"이 열리는지
- [ ] 해외 공고 메뉴에 공고 목록과 "업데이트 날짜 · World Bank N건 · EU TED N건"이 보이는지
- [ ] 공고의 "원문 보기"가 세계은행 · TED 공고 페이지로 열리는지, "일정에 추가"하면 입찰 일정에 들어가는지
- [ ] 실제 영문 PDF 하나를 올려 분석되는지 · 엑셀 내보내기가 되는지
- [ ] (선택) 카카오톡 · 링크드인에 주소를 붙였을 때 사진이 뜨게 하려면: 저장소에서 `index.html` 편집(연필 아이콘) → `content="photos/substation.jpg"`를 `content="https://아이디.github.io/bidlens/photos/substation.jpg"`로 바꾸고 Commit

## 해외 공고는 어디서 오나요?
| 출처 | 내용 | 키 |
|---|---|---|
| World Bank 조달 공고 API (`search.worldbank.org/api/v2/procnotices`) | 세계은행 차관 사업의 입찰 공고 · 공고 원문 포함 | 필요 없음 |
| EU TED Search API v3 (`api.ted.europa.eu/v3/notices/search`) | EU 공공조달 중 변압기 · 개폐기 · 전선 CPV 분류 | 필요 없음 |

- 입찰 공고(Invitation for Bids 등)만 남기고 낙찰 공고 · 컨설팅 공고 · 마감 지난 공고는 뺐어요.
- 품목은 공고 제목 · 설명(세계은행은 사업명 포함)에 나오는 단어로 변압기 / 변전소 / 개폐기 · 차단기 / 송배전 선로 / 기타 전력으로 나눠요. EU 공고 중 영어 제목이 없는 것은 CPV 분류 코드로 나눠요.
- 공고 목록이 바뀌었을 때(또는 하루에 한 번)만 저장소에 기록해서 기록이 쓸데없이 쌓이지 않아요. 한 출처가 잠시 실패하면 그 출처의 이전 목록을 유지해요.
- 공고 내용과 마감 시각은 반드시 발주처 원문으로 확인하세요.

## 인터넷에서 불러오는 것
- 글꼴: Google Fonts · PDF 읽기: pdf.js 3.11.174 · 엑셀: SheetJS 0.18.5 · 스캔 글자 인식: Tesseract.js 5.1.1 · 질의서 PDF 만들기: pdf-lib 1.17.1

## 참고
- 질의서 현지어 번역: Claude 안에서 열면 Claude가 번역하고, 배포한 사이트에서는 Google 번역 창으로 넘겨줘요. 번역은 참고용이니 원문과 대조하세요.
- 로그인은 데모용이에요. 실제 계정 인증은 하지 않아요.
- 샘플 입찰서(ABC Power Authority)는 가상의 문서예요.
- 판정 결과는 검토를 돕는 참고 자료예요. 실제 입찰 결정은 원문과 설계팀 검토로 확인하세요.
