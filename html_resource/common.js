(function() {
  var path = location.pathname;
  var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  var isIndex = (page === 'index.html' || page === '' || page === '/');
  var locationHref = isIndex ? '#section-location' : 'location.html';

  var group1 = ['doctors.html','tour.html','location.html','equipment.html','results.html'];
  var group2 = ['ulthera.html','oligio.html','inmode.html'];
  var g1 = group1.indexOf(page) !== -1;
  var g2 = group2.indexOf(page) !== -1;
  var isProm = (page === 'promotion.html');

  var dc = 'block py-3 px-5 md:px-5 px-3.5 text-white/70 text-[13px] md:text-[13px] text-xs whitespace-nowrap no-underline hover:text-primary transition-colors';
  var ac = 'block py-3 px-5 md:px-5 px-3.5 text-primary text-[13px] md:text-[13px] text-xs whitespace-nowrap no-underline hover:text-primary transition-colors';

  var html = '' +
  '<div class="nav-dropdown" id="dropdownMenu">' +
    '<a href="doctors.html">의료진 소개</a>' +
    '<a href="tour.html">둘러보기</a>' +
    '<a href="location.html">오시는 길</a>' +
    '<a href="equipment.html">루미너스 장비</a>' +
    '<a href="results.html">전후사진</a>' +
  '</div>' +
  '<div class="nav-dropdown" id="dropdownMenu2">' +
    '<a href="ulthera.html">울쎄라</a>' +
    '<a href="oligio.html">올리지오</a>' +
    '<a href="inmode.html">인모드</a>' +
  '</div>' +

  '<div id="mobileNav" class="fixed inset-0 z-[2000] bg-black/95 flex flex-col items-center justify-center opacity-0 pointer-events-none transition-opacity duration-400">' +
    '<button onclick="closeMobileNav()" class="absolute top-6 right-8 text-3xl text-white cursor-pointer bg-transparent border-none">&times;</button>' +
    '<ul class="text-center list-none p-0">' +
      '<li><a href="index.html" onclick="closeMobileNav()" class="block py-4 px-10 text-white text-lg tracking-widest no-underline hover:text-primary transition-colors">루미너스의원</a></li>' +
      '<li><a href="#" onclick="closeMobileNav()" class="block py-4 px-10 text-white text-lg tracking-widest no-underline hover:text-primary transition-colors">리프팅 센터</a></li>' +
      '<li><a href="#" onclick="closeMobileNav()" class="block py-4 px-10 text-white text-lg tracking-widest no-underline hover:text-primary transition-colors">피부</a></li>' +
      '<li><a href="#" onclick="closeMobileNav()" class="block py-4 px-10 text-white text-lg tracking-widest no-underline hover:text-primary transition-colors">쁘띠</a></li>' +
      '<li><a href="#" onclick="closeMobileNav()" class="block py-4 px-10 text-white text-lg tracking-widest no-underline hover:text-primary transition-colors">바디</a></li>' +
      '<li><a href="#" onclick="closeMobileNav()" class="block py-4 px-10 text-white text-lg tracking-widest no-underline hover:text-primary transition-colors">여드름 · 모공</a></li>' +
      '<li><a href="#" onclick="closeMobileNav()" class="block py-4 px-10 text-white text-lg tracking-widest no-underline hover:text-primary transition-colors">제모</a></li>' +
      '<li><a href="location.html" onclick="closeMobileNav()" class="block py-4 px-10 text-white text-lg tracking-widest no-underline hover:text-primary transition-colors">오시는 길</a></li>' +
    '</ul>' +
  '</div>' +

  '<header class="fixed top-0 left-0 w-full z-[1000] bg-black/85 backdrop-blur-md">' +
    '<div class="relative flex items-center justify-center max-w-[1400px] mx-auto py-3.5 px-10 md:px-10 px-5">' +
      '<div onclick="openMobileNav()" class="absolute left-5 md:left-10 top-1/2 -translate-y-1/2 flex flex-col gap-[5px] cursor-pointer">' +
        '<span class="w-6 h-0.5 bg-white block"></span>' +
        '<span class="w-6 h-0.5 bg-white block"></span>' +
        '<span class="w-6 h-0.5 bg-white block"></span>' +
      '</div>' +
      '<a href="index.html" class="font-en text-2xl md:text-[28px] font-bold text-white tracking-[6px] uppercase no-underline">' +
        'LUMIN<span class="text-primary">U</span>S' +
        '<span class="block font-kr text-[10px] tracking-[4px] text-muted text-center mt-0.5">CLINIC</span>' +
      '</a>' +
      '<a href="' + locationHref + '" class="absolute right-5 md:right-10 top-1/2 -translate-y-1/2 text-primary text-[22px] no-underline">' +
        '<i class="fas fa-map-marker-alt"></i>' +
      '</a>' +
    '</div>' +
    '<nav class="border-t border-white/[0.08] overflow-x-auto overflow-y-hidden scrollbar-hide" style="-webkit-overflow-scrolling:touch">' +
      '<ul class="flex justify-center max-w-[1400px] mx-auto w-max min-w-full list-none p-0 md:px-0 px-2.5">' +
        '<li><a href="#" data-dropdown="dropdownMenu" onclick="toggleDropdown(event)" class="' + (g1 ? ac : dc) + '">루미너스의원 <i class="fas fa-chevron-down text-[9px] ml-0.5 opacity-50"></i></a></li>' +
        '<li><a href="#" data-dropdown="dropdownMenu2" onclick="toggleDropdown(event)" class="' + (g2 ? ac : dc) + '">리프팅 센터 <i class="fas fa-chevron-down text-[9px] ml-0.5 opacity-50"></i></a></li>' +
        '<li><a href="#" class="' + dc + '">피부</a></li>' +
        '<li><a href="#" class="' + dc + '">쁘띠</a></li>' +
        '<li><a href="#" class="' + dc + '">바디</a></li>' +
        '<li><a href="#" class="' + dc + '">여드름 · 모공</a></li>' +
        '<li><a href="#" class="' + dc + '">제모</a></li>' +
        '<li><a href="#" class="' + dc + '">수액 · 예방접종</a></li>' +
        '<li><a href="#" class="' + dc + '">공지사항</a></li>' +
      '</ul>' +
    '</nav>' +
  '</header>';

  var footerHTML = '' +
  '<footer class="bg-dark-bg pt-12 pb-8 md:pb-20 px-5 md:px-10 text-white/40 text-[13px]">' +
    '<div class="max-w-[1200px] mx-auto">' +
      '<div class="flex gap-6 mb-6">' +
        '<a href="#" class="text-white/60 text-[13px] no-underline hover:text-primary transition-colors">이용약관</a>' +
        '<a href="#" class="text-white/80 text-[13px] font-bold no-underline hover:text-primary transition-colors">개인정보처리방침</a>' +
      '</div>' +
      '<div class="leading-relaxed mb-5">' +
        '상호명 : 루미너스의원 | 대표 : 홍길동 | 주소 : 인천 연수구 해돋이로 160-15, 206-211호(송도동, 더퍼스트시티)<br>' +
        '대표전화 : 032-833-9909 | 사업자번호 : 000-00-00000 | 개인정보관리책임자 : 홍길동<br>' +
        '진료시간 : [월-금] AM 09:30 – PM 08:00 [토] AM 09:30 – PM 03:30 일요일 휴무' +
      '</div>' +
      '<div class="border-t border-white/[0.06] pt-5 text-xs">' +
        '&copy; 루미너스의원 2026. All Rights Reserved.' +
      '</div>' +
    '</div>' +
  '</footer>';

  var promoCls = isProm
    ? 'flex-1 flex flex-col items-center justify-center py-3 md:py-4 px-1 text-primary gap-1 text-[11px] md:text-xs no-underline bg-white/5'
    : 'flex-1 flex flex-col items-center justify-center py-3 md:py-4 px-1 text-white gap-1 text-[11px] md:text-xs no-underline hover:bg-white/5 transition-colors';
  var promoIcon = isProm
    ? '<i class="fas fa-gift text-lg md:text-xl"></i>'
    : '<i class="fas fa-gift text-lg md:text-xl text-primary"></i>';

  var bottomHTML = '' +
  '<div class="flex fixed bottom-0 left-0 w-full bg-dark z-[999] border-t border-white/10">' +
    '<a href="tel:032-833-9909" class="flex-1 flex flex-col items-center justify-center py-3 md:py-4 px-1 text-white gap-1 text-[11px] md:text-xs no-underline hover:bg-white/5 transition-colors"><i class="fas fa-phone-alt text-lg md:text-xl text-primary"></i>전화하기</a>' +
    '<a href="#" class="flex-1 flex flex-col items-center justify-center py-3 md:py-4 px-1 text-white gap-1 text-[11px] md:text-xs no-underline hover:bg-white/5 transition-colors"><i class="fas fa-calendar-check text-lg md:text-xl text-primary"></i>네이버예약</a>' +
    '<a href="#" class="flex-1 flex flex-col items-center justify-center py-3 md:py-4 px-1 text-white gap-1 text-[11px] md:text-xs no-underline hover:bg-white/5 transition-colors"><i class="fas fa-comment-dots text-lg md:text-xl text-primary"></i>카톡문의</a>' +
    '<a href="promotion.html" class="' + promoCls + '">' + promoIcon + '프로모션</a>' +
    '<a href="' + locationHref + '" class="flex-1 flex flex-col items-center justify-center py-3 md:py-4 px-1 text-white gap-1 text-[11px] md:text-xs no-underline hover:bg-white/5 transition-colors"><i class="fas fa-map-marker-alt text-lg md:text-xl text-primary"></i>오시는길</a>' +
  '</div>';

  var temp = document.createElement('div');
  temp.innerHTML = html;
  var frag = document.createDocumentFragment();
  while (temp.firstChild) frag.appendChild(temp.firstChild);
  document.body.insertBefore(frag, document.body.firstChild);

  document.body.insertAdjacentHTML('beforeend', footerHTML + bottomHTML);

  window.toggleDropdown = function(e) {
    e.preventDefault();
    var trigger = e.currentTarget;
    var menuId = trigger.dataset.dropdown;
    var menu = document.getElementById(menuId);
    document.querySelectorAll('.nav-dropdown').forEach(function(d) { if (d.id !== menuId) d.classList.remove('open'); });
    var rect = trigger.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    menu.classList.toggle('open');
  };

  document.addEventListener('click', function(e) {
    if (!e.target.closest('[data-dropdown]') && !e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown').forEach(function(d) { d.classList.remove('open'); });
    }
  });

  window.openMobileNav = function() {
    var nav = document.getElementById('mobileNav');
    nav.style.opacity = '1';
    nav.style.pointerEvents = 'all';
    document.body.style.overflow = 'hidden';
  };

  window.closeMobileNav = function() {
    var nav = document.getElementById('mobileNav');
    nav.style.opacity = '0';
    nav.style.pointerEvents = 'none';
    document.body.style.overflow = '';
  };

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.fade-up').forEach(function(el) { observer.observe(el); });
})();
