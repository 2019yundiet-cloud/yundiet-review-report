윤식단 자사몰(아임웹) 리뷰 UI 개선 코드
==========================================

파일
- yundiet-review.css : 디자인(상단 바·분포·키워드·카드 배지 + 아임웹 기본 리뷰 재스타일)
- yundiet-review.js  : 주입 스크립트(상단 바/분포/키워드/카드 배지 + 부드러운 스크롤)

빠른 적용 (아임웹)
1) 관리자 > 사이트 설정 > 고급 > "head/body 코드" (또는 디자인 모드 > 코드 입력)
2) <head> 영역에 CSS 붙여넣기:
     <style> (yundiet-review.css 내용) </style>
3) </body> 직전 영역에 JS 붙여넣기:
     <script> (yundiet-review.js 내용) </script>
4) yundiet-review.js 상단 DATA 객체에 상품별 집계 수치(네이버/쿠팡 합산)를 입력
     예) 1096: { avg:4.9, count:2431, repurchase:68, dist:[89,8,2,1,1], keywords:[['포만감 좋아요',1012], ...] }

호스팅 참조(테스트용, 빠름)
  <link rel="stylesheet" href="https://2019yundiet-cloud.github.io/yundiet-review-report/code/yundiet-review.css">
  <script src="https://2019yundiet-cloud.github.io/yundiet-review-report/code/yundiet-review.js" defer></script>
  ※ 운영에는 인라인(직접 붙여넣기)을 권장 — GitHub Pages는 상용 CDN이 아님.

중요
- 자사몰 네이티브 리뷰는 현재 0건이므로 '숫자'는 DATA에 직접 넣어야 노출됩니다.
- 근본 해결(네이버/쿠팡 리뷰를 자사몰로 자동 수집)은 CREMA 연동 권장 → implementation.html 참고.
- CREMA 설치 후에는 yundiet-review.js 의 INJECT_WIDGET=false 로 두고
  상단 바(INJECT_TOPBAR)·카드 배지(INJECT_CARDS)만 사용하면 충돌 없음.

확인한 실제 셀렉터 (yundiet.com, 2026-06)
- 가격            .sale_price.pay_number
- 리뷰 영역       .prod_detail_review (#prod_detail_review_target / _mobile)
- 리뷰 카운트     ._review_count_text
- 리뷰 요약 자리   .review_count_summary_wrap
- 리뷰 렌더 객체   window.SITE_SHOP_REVIEW
- 상품 링크       a[href*="shop_view"]  (idx=NNN)
