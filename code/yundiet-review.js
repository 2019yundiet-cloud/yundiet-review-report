/* ============================================================
   윤식단 자사몰(아임웹) 리뷰 UI 개선 — JS 주입 스크립트
   ------------------------------------------------------------
   하는 일
   1) 상품 상단(가격 .sale_price.pay_number 아래)에 별점 요약 바 주입
   2) 리뷰 영역(.prod_detail_review) 상단에 평균★ + 별점분포 + 키워드칩 주입
   3) 상품 목록 카드(a[href*="shop_view"])에 별점 배지 주입
   4) '후기 보기' → 리뷰 영역으로 부드럽게 스크롤

   왜 CONFIG로 숫자를 넣나?
   - 현재 자사몰 네이티브 리뷰는 0건이고, 진짜 리뷰는 네이버/쿠팡에 있음.
   - 따라서 (A) CREMA로 타채널 리뷰를 자사몰로 import 하기 전까지는
     아래 CONFIG에 '집계 수치'를 넣어 신뢰 지표를 먼저 노출.
   - CREMA 설치 후에는 CREMA 위젯이 분포/카드를 그리므로, 이 스크립트는
     상단 바 + 카드 배지만 남기고 INJECT_WIDGET=false 로 끄면 됨.

   적용 위치: 아임웹 [사이트 설정 > 고급 > body 닫기 전 스크립트]
            또는 [디자인 모드 > 코드 입력] 위젯 (제품 상세/목록 페이지)
   ============================================================ */
(function () {
  'use strict';

  /* ===================== 설정 ===================== */
  var INJECT_WIDGET = true;   // 리뷰영역 분포/키워드 주입 (CREMA 도입 시 false)
  var INJECT_TOPBAR = true;   // 상단 별점 요약 바
  var INJECT_CARDS  = true;   // 목록 카드 별점 배지

  // 상품별 집계 데이터 (idx = shop_view?idx=NNN)
  // 네이버/쿠팡/자사몰 합산 수치를 넣으세요. 없으면 DEFAULT 사용.
  var DATA = {
    1096: { avg: 4.9, count: 2431, repurchase: 68,
            dist: [89, 8, 2, 1, 1],           // 5★→1★ 비율(%)
            keywords: [['포만감 좋아요',1012],['맛있어요',884],['배송 빨라요',671],['혈당 안정',342]] }
    // , 1097: { avg:4.8, count:1204, repurchase:55, dist:[85,10,3,1,1], keywords:[...] }
  };
  var DEFAULT = { avg: 4.8, count: 0, repurchase: 0, dist: [88,8,2,1,1], keywords: [] };

  /* ===================== 유틸 ===================== */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function getIdx(href) { var m = (href || location.href).match(/[?&]idx=(\d+)/); return m ? +m[1] : null; }
  function cfg(idx) { return (idx && DATA[idx]) ? DATA[idx] : DEFAULT; }
  function starsHTML(avg) {
    var full = Math.round(avg), s = '';
    for (var i = 1; i <= 5; i++) s += '<span' + (i > full ? ' class="off"' : '') + '>★</span>';
    return s;
  }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function once(node, flag) { if (node.dataset[flag]) return false; node.dataset[flag] = '1'; return true; }

  /* ============== ① 상단 별점 요약 바 ============== */
  function injectTopbar() {
    if (!INJECT_TOPBAR) return;
    var price = $('.sale_price.pay_number') || $('[class*="sale_price"]');
    if (!price) return;
    // 가격을 감싸는 블록 다음에 삽입 (중복 방지)
    var host = price.closest('.price_info, .detail_price, .product_info, .shop_view_info') || price.parentElement;
    if (!host || !once(host, 'ydTopbar')) return;
    var d = cfg(getIdx());
    if (!d.count) return; // 집계 수치 없으면 노출 안 함
    var bar = el(
      '<div class="yd-topbar">' +
        '<span class="yd-stars">' + starsHTML(d.avg) + '</span>' +
        '<span class="yd-score">' + d.avg.toFixed(1) + '</span>' +
        '<span class="yd-meta">리뷰 <b>' + d.count.toLocaleString() + '</b>개' +
          (d.repurchase ? ' · 재구매율 <b>' + d.repurchase + '%</b>' : '') + '</span>' +
        '<button type="button" class="yd-go">후기 보기 ↓</button>' +
      '</div>'
    );
    bar.querySelector('.yd-go').addEventListener('click', function () {
      var t = $('#prod_detail_review_target') || $('.prod_detail_review') || $('[data-target="prod_detail_review"]');
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    host.parentNode.insertBefore(bar, host.nextSibling);
  }

  /* ====== ② 리뷰영역 평균/분포/키워드 헤더 ====== */
  function injectWidgetHeader() {
    if (!INJECT_WIDGET) return;
    // 화면에 보이는 리뷰 컨테이너 선택 (PC/모바일 중 표시된 것)
    var targets = $all('.prod_detail_review').filter(function (t) { return t.offsetParent !== null; });
    var box = targets[0] || $('.prod_detail_review');
    if (!box || !once(box, 'ydHeader')) return;
    var d = cfg(getIdx());
    if (!d.count) return;
    var rows = d.dist.map(function (p, i) {
      var star = 5 - i, n = Math.round(d.count * p / 100);
      return '<div class="row"><span class="lab">' + star + '★</span>' +
             '<div class="bar"><span style="width:' + p + '%"></span></div>' +
             '<span class="pc">' + n.toLocaleString() + '</span></div>';
    }).join('');
    var kw = d.keywords.length ? ('<div class="yd-kw"><span class="kt">자주 나온 말</span>' +
      d.keywords.map(function (k) { return '<span class="chip">' + k[0] + ' ' + k[1].toLocaleString() + '</span>'; }).join('') +
      '</div>') : '';
    var header = el(
      '<div class="yd-widget-head">' +
        '<div class="yd-summary">' +
          '<div class="yd-avg"><div class="big">' + d.avg.toFixed(1) + '</div>' +
            '<div style="color:#ffb01f;font-size:18px;margin-top:4px">' + starsHTML(d.avg).replace(/class="off"/g, 'style="color:#ddd6c4"') + '</div>' +
            '<div class="cnt">총 <b>' + d.count.toLocaleString() + '</b>개 리뷰' +
              (d.repurchase ? '<br>재구매율 <b>' + d.repurchase + '%</b>' : '') + '</div></div>' +
          '<div class="yd-dist">' + rows + '</div>' +
        '</div>' + kw +
      '</div>'
    );
    box.insertBefore(header, box.firstChild);
  }

  /* ============== ③ 상품 목록 카드 별점 배지 ============== */
  function injectCardBadges() {
    if (!INJECT_CARDS) return;
    $all('a[href*="shop_view"]').forEach(function (a) {
      var idx = getIdx(a.getAttribute('href'));
      if (!idx || !DATA[idx]) return;
      var card = a.closest('li, .item, ._item, [class*="prod"]') || a.parentElement;
      if (!card || !once(card, 'ydBadge')) return;
      var d = DATA[idx];
      var nameEl = card.querySelector('[class*="name"], [class*="title"], .subject') || a;
      var badge = el(
        '<div class="yd-card-badge">' +
          '<span class="s">' + starsHTML(d.avg).replace(/<span(?! class)/g, '<span').replace(/class="off"/g, 'class="off"') + '</span>' +
          '<span class="v">' + d.avg.toFixed(1) + '</span>' +
          '<span class="c">(' + d.count.toLocaleString() + ')</span>' +
        '</div>'
      );
      // 상품명 바로 아래 삽입
      if (nameEl && nameEl.parentNode) nameEl.parentNode.insertBefore(badge, nameEl.nextSibling);
      else card.appendChild(badge);
    });
  }

  /* ============== 실행 + 비동기 렌더 대응 ============== */
  function run() { injectTopbar(); injectWidgetHeader(); injectCardBadges(); }

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);

  // 아임웹은 리뷰/목록을 AJAX로 늦게 그리므로 변경 감지로 재시도
  var mo = new MutationObserver(function () { run(); });
  mo.observe(document.body, { childList: true, subtree: true });
  // 안전장치: 8초 후 옵저버 해제
  setTimeout(function () { mo.disconnect(); }, 8000);
})();
