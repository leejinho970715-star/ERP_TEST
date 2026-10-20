# 이미지 및 브랜드 에셋

## 사용자 제공 파일

원본 이미지는 수정하지 않고 프로젝트 내 파일명만 정리해 복사했습니다.

| 제공 파일 | 프로젝트 파일 | 용도 |
| --- | --- | --- |
| `logo.png` | `assets/iwon-logo.png` | 회사 로고 |
| `WEHAGO.png` | `assets/product-wehago.png` | WEHAGO 추천 카드 |
| `amaranth10 3D logo.png` | `assets/product-amaranth.png` | Amaranth 10 추천 카드 |
| `OmniEsol.png` | `assets/product-omni.png` | OmniEsol 추천 카드 |
| `ONE AI 3D logo.png` | `assets/product-oneai.png` | Amaranth 10과 함께 추천 |

PMS는 전달된 공식 이미지가 없어 단순한 P 모노그램을 사용합니다. 추후 `erp-config.js`의 `productIcons.pms`에 공식 이미지 경로를 넣으면 교체됩니다.

## 생성 이미지

`assets/erp-dashboard.png`: 내장 ImageGen으로 생성한 독립적인 3D 클레이모피즘 이미지입니다. RGBA PNG이며 알파 범위 0–255로 투명 배경을 확인했습니다. 별도 배경 이미지 위에 겹쳐 표시합니다.

최종 생성 프롬프트:

> Use case stylized-concept. Standalone isolated 3D claymorphism ERP dashboard illustration for a sophisticated Korean B2B website. A floating rounded matte porcelain white dashboard at gentle front isometric angle, blank blue and lavender UI tiles, bar chart, donut chart, three connected floating modules depicting inventory cube, people and project checklist. Pale sky blue, periwinkle and soft cyan palette, excellent polished studio render with subtle contact shadows only on the objects. Centered entire composition fits inside image with generous margins. STRICTLY transparent alpha background, no opaque background, no floor, no background scene, no black rectangle, no text, no letters, no numbers, no logos. This must be a PNG cutout that can float independently over a separate pastel website background.

`assets/erp-background.png`: 내장 ImageGen으로 별도 생성한 파스텔 하늘색 테크놀로지 배경입니다. 텍스트 없는 이미지 위에 CSS 그라데이션과 희미한 격자를 추가합니다.

배경 생성 프롬프트:

> Use case stylized-concept. Asset type: extremely subtle wide 16:9 website background plate for a refined enterprise ERP consulting landing page. Pale ice blue, near white pastel sky blue gradients, very subtle luminous thin flowing technology lines and distant translucent frosted glass arcs concentrated on the right and lower right, barely visible fine network connections, gentle lavender haze in lower right corner. Upper left and entire left half mostly clean near-white blue negative space for dark text. Sophisticated minimal B2B aesthetic, quiet airy premium light, no foreground objects, no dashboards, no icons, no logos, no words, no letters, no numbers, no watermark. This background will be used behind a separately generated transparent 3D dashboard.

`assets/erp-og.png`: 위 대시보드·회사 로고·진단 제목을 조합한 1200×630 소셜 이미지입니다. `scripts/create-social-assets.py`로 재생성할 수 있습니다(Pillow 필요).

`assets/erp-favicon.svg`: 대시보드 막대그래프를 상징하는 코드 기반 벡터 아이콘입니다. `assets/erp-touch.png`는 동일한 방향의 180×180 런처 아이콘입니다.

사이트 UI·결과 다운로드·OG 이미지 모두 Pretendard를 사용합니다. OG를 재생성하려면 [공식 Pretendard v1.3.9](https://github.com/orioncactus/pretendard/tree/v1.3.9/packages/pretendard/dist/public/static/alternative)의 Regular/Bold TTF를 `.tmp/Pretendard-Regular.ttf`, `.tmp/Pretendard-Bold.ttf`에 준비하세요.
