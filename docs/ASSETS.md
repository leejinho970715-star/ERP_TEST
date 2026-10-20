# 이미지 및 브랜드 에셋

## 사용자 제공 제품소개서

PDF는 내용이나 페이지를 수정하지 않고 URL에 안전한 파일명으로 복사했습니다.

| 제공 파일 | 프로젝트 파일 |
| --- | --- |
| `Amaranth10 제품 소개서.pdf` | `brochures/amaranth10.pdf` |
| `WEHAGO 제품소개서(2).pdf` | `brochures/wehago-overview.pdf` |
| `WEHAGO 제품소개서.pdf` | `brochures/wehago-services.pdf` |
| `OmniEsol&ONEAI 제품소개서.pdf` | `brochures/omniesol-oneai.pdf` |

ONE AI는 마지막 통합본의 PDF 7쪽으로 연결합니다. `erp-config.js`에서 제품별 파일·페이지·버튼 문구를 관리합니다. PMS 전용 PDF는 제공되지 않아 공식 웹 안내를 사용합니다. 분석과 개편 제안은 [PRODUCT-REVIEW.md](PRODUCT-REVIEW.md)에 정리했습니다.

## 사용자 제공 파일

원본 이미지는 수정하지 않고 프로젝트 내 파일명만 정리해 복사했습니다.

| 제공 파일 | 프로젝트 파일 | 용도 |
| --- | --- | --- |
| `logo.png` | `assets/iwon-logo.png` | 회사 로고 |
| `WEHAGO.png` | `assets/product-wehago.png` | WEHAGO 추천 카드 |
| `amaranth10 3D logo.png` | `assets/product-amaranth.png` | Amaranth 10 추천 카드 |
| `OmniEsol.png` | `assets/product-omni.png` | OmniEsol 추천 카드 |
| `ONE AI 3D logo.png` | `assets/product-oneai.png` | Amaranth 10과 함께 추천 |
| `초코푸들.png` | `assets/result-poodle.png` | 랜덤 결과 캐릭터 |
| `포메라니안.png` | `assets/result-pomeranian.png` | 랜덤 결과 캐릭터 |
| `시바견.png` | `assets/result-shiba.png` | 랜덤 결과 캐릭터 |

강아지 이미지는 이전 구현의 에셋으로 보관하며 현재 결과에는 사용하지 않습니다. 현재는 사용자 요청에 따라 온이·원이 두 캐릭터를 모든 결과와 결과 PNG에 고정으로 함께 표시합니다. 공유 링크에서도 두 캐릭터가 동일하게 표시됩니다.

폭죽은 원본 AX/DX 사이트 `app.js`의 `celebrate()` 효과를 `erp-effects.js`로 가져왔습니다. 동일한 5색·3개 발사점·165개 입자·중력·회전·150프레임 동작을 사용하고, 화면 전환 시 취소 및 모션 감소 설정에서는 생략하도록 처리했습니다. 헤더부터 푸터까지 공통 배경 이미지를 적용합니다.

PMS는 전달된 공식 이미지가 없어 단순한 P 모노그램을 사용합니다. 추후 `erp-config.js`의 `productIcons.pms`에 공식 이미지 경로를 넣으면 교체됩니다.

## 생성 이미지

`assets/erp-dashboard.png`: 내장 ImageGen 편집으로 외부 카드·연결선을 제거한 단일 대시보드입니다. 1424×1104 RGBA PNG, 알파 범위 0–254. 별도 배경 위에 표시하고 `dashboard-hover`의 상하 이동만 적용합니다. 메인 라벨·궤도 장식은 제거했고 소요시간을 CTA 위로 옮겼습니다.

최초 생성 프롬프트 (이후 단일 대시보드로 교체):

> Use case stylized-concept. Standalone isolated 3D claymorphism ERP dashboard illustration for a sophisticated Korean B2B website. A floating rounded matte porcelain white dashboard at gentle front isometric angle, blank blue and lavender UI tiles, bar chart, donut chart, three connected floating modules depicting inventory cube, people and project checklist. Pale sky blue, periwinkle and soft cyan palette, excellent polished studio render with subtle contact shadows only on the objects. Centered entire composition fits inside image with generous margins. STRICTLY transparent alpha background, no opaque background, no floor, no background scene, no black rectangle, no text, no letters, no numbers, no logos. This must be a PNG cutout that can float independently over a separate pastel website background.

`assets/erp-background.png`: 내장 ImageGen으로 별도 생성한 파스텔 하늘색 테크놀로지 배경입니다. 텍스트 없는 이미지 위에 CSS 그라데이션과 희미한 격자를 추가합니다.

배경 생성 프롬프트:

> Use case stylized-concept. Asset type: extremely subtle wide 16:9 website background plate for a refined enterprise ERP consulting landing page. Pale ice blue, near white pastel sky blue gradients, very subtle luminous thin flowing technology lines and distant translucent frosted glass arcs concentrated on the right and lower right, barely visible fine network connections, gentle lavender haze in lower right corner. Upper left and entire left half mostly clean near-white blue negative space for dark text. Sophisticated minimal B2B aesthetic, quiet airy premium light, no foreground objects, no dashboards, no icons, no logos, no words, no letters, no numbers, no watermark. This background will be used behind a separately generated transparent 3D dashboard.

`assets/erp-og.png`: 위 대시보드·회사 로고·진단 제목을 조합한 1200×630 소셜 이미지입니다. `scripts/create-social-assets.py`로 재생성할 수 있습니다(Pillow 필요).

`assets/erp-favicon.svg`: 대시보드 막대그래프를 상징하는 코드 기반 벡터 아이콘입니다. `assets/erp-touch.png`는 동일한 방향의 180×180 런처 아이콘입니다.

사이트 UI·결과 다운로드·OG 이미지 모두 Pretendard를 사용합니다. OG를 재생성하려면 [공식 Pretendard v1.3.9](https://github.com/orioncactus/pretendard/tree/v1.3.9/packages/pretendard/dist/public/static/alternative)의 Regular/Bold TTF를 `.tmp/Pretendard-Regular.ttf`, `.tmp/Pretendard-Bold.ttf`에 준비하세요.


## 2026-10-20 단순화·캐릭터 변경

- 도구: 내장 ImageGen 편집 모드. 최종 파일은 모두 프로젝트 `assets/`에 저장합니다.
- `assets/character-oni.png` (1254×1254 RGBA, alpha 0–255): 제공된 `캐릭터_온이.png`에서 왼쪽 정면 캐릭터만 추출한 투명 PNG.
- `assets/character-woni.png` (1254×1254 RGBA, alpha 0–255): 제공된 `캐릭터_원이.png`에서 왼쪽 정면 캐릭터만 추출한 투명 PNG.
- 각각의 디자인·색상·정면 자세를 유지하도록 지시한 이미지 편집 결과입니다. 단일 캐릭터 PNG 두 장이며 결과에서는 온이(왼쪽)와 원이(오른쪽)가 함께 나옵니다. 바탕은 검은 사각형이 아닌 실제 알파 투명입니다.
- `erp-effects.js`의 `resultCharacters`가 고정 목록이고, 결과 화면/PNG 저장에서 같은 목록을 사용합니다. 강아지 랜덤 선택 함수는 제거했습니다.
- 메인 하단 `관리자 페이지 · DB` 링크는 인증이 있는 `erp-admin.html`로 이동합니다.

### 최종 대시보드 편집 프롬프트

> Use case: precise-object-edit. Edit target: the provided ERP dashboard illustration. Simplify it to ONLY ONE standalone rounded rectangular 3D dashboard panel. Remove all three external connected cards (people card on the left, box card above, checklist card on the right), all connectors, pipes, knobs, detached items and any external labels. Preserve the soft matte claymorphism style, white porcelain panel, pastel sky blue / cyan / lavender internal bar chart and donut chart. Compact minimal internal UI, no text, no letters, no numbers. Gentle front three-quarter angle, fully visible complete dashboard centered with 12% transparent margins. Actual transparent alpha PNG background, no floor or opaque backdrop. One unified dashboard object only, suitable to animate as floating on a website. No other decorations or surrounding objects.

### 온이 추출 프롬프트

> Use case: background-extraction, identity-preserve. Edit target: the attached purple character turnaround sheet. Extract ONLY the LEFTMOST FRONT FACING purple character, named 온이, as ONE complete full body isolated PNG cutout with true transparent alpha background. Preserve the original character design precisely: purple rounded costume with two yellow orange striped horns with purple tips, blonde hair center part, white face, brown eyes, peach cheeks, smiling open mouth, short purple arms and feet, the original proportions, colors and soft 3D finish. Remove the background, floor, ground shadow, all other views and all other characters. Center this one frontal character on a portrait/square transparent canvas with 8% clear padding around its entire silhouette. Do not redesign, add props, labels or text. Preserve white face and white ear interiors; they are part of character, not background.

### 원이 추출 프롬프트

> Use case: background-extraction, identity-preserve. Edit target: the attached blue character turnaround sheet. Extract ONLY the LEFTMOST FRONT FACING blue character, named 원이, as ONE complete full body isolated PNG cutout with true transparent alpha background. Preserve original character design precisely: sky blue rounded costume with ONE central yellow orange striped horn with a blue round tip, blonde scalloped bangs, white face, brown eyes, peach cheeks, happy smiling open mouth, short blue arms and feet, same original proportions colors and soft 3D finish. Remove background, floor, shadow, all other views and all other characters. Center this one frontal character on square transparent canvas with 8% clear padding around entire silhouette. No redesign, no added props, no labels or text. Preserve white face and white inner ears as part of character.
