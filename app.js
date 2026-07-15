(() => {
  'use strict';

  const KEYS = {
    plan: 'river-screen-plan-v1',
    checks: 'river-screen-checks-v1'
  };

  const PLANS = {
    jinju: 'CUT A · 진주혁신 19:25',
    sacheon: 'CUT B · 사천 드라이브 22:00'
  };

  function toast(message) {
    let node = document.querySelector('.toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'toast';
      node.setAttribute('role', 'status');
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(node._timer);
    node._timer = setTimeout(() => node.classList.remove('show'), 2200);
  }

  function renderPlan(plan) {
    const label = PLANS[plan] || '아직 선택하지 않음';
    document.querySelectorAll('[data-plan-status]').forEach((node) => {
      node.textContent = label;
    });
    document.querySelectorAll('[data-plan-button]').forEach((button) => {
      const selected = button.dataset.planButton === plan;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    document.querySelectorAll('[data-plan-panel]').forEach((panel) => {
      panel.classList.toggle('selected', panel.dataset.planPanel === plan);
    });
  }

  function selectPlan(plan, announce = true) {
    if (!PLANS[plan]) return;
    localStorage.setItem(KEYS.plan, plan);
    renderPlan(plan);
    if (announce) toast(`${PLANS[plan]}로 저장했습니다.`);
  }

  function setupPlans() {
    const saved = localStorage.getItem(KEYS.plan);
    renderPlan(saved);
    document.querySelectorAll('[data-plan-button]').forEach((button) => {
      button.addEventListener('click', () => {
        selectPlan(button.dataset.planButton, false);
        document.querySelector(`[data-plan-panel="${button.dataset.planButton}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
    document.querySelectorAll('[data-select-plan]').forEach((button) => {
      button.addEventListener('click', () => selectPlan(button.dataset.selectPlan));
    });
  }

  function setupCountdown() {
    const output = document.querySelector('[data-countdown]');
    if (!output) return;
    const target = new Date('2026-07-18T08:35:00+09:00').getTime();
    const tick = () => {
      let delta = target - Date.now();
      if (delta <= 0) {
        output.textContent = 'DAY TRIP STARTED';
        return;
      }
      const days = Math.floor(delta / 86400000);
      delta %= 86400000;
      const hours = Math.floor(delta / 3600000);
      delta %= 3600000;
      const minutes = Math.floor(delta / 60000);
      const seconds = Math.floor((delta % 60000) / 1000);
      output.textContent = `D-${days} · ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  function setupChecks() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(KEYS.checks) || '{}');
    } catch (_) {
      saved = {};
    }
    document.querySelectorAll('[data-check]').forEach((box) => {
      box.checked = Boolean(saved[box.dataset.check]);
      box.addEventListener('change', () => {
        saved[box.dataset.check] = box.checked;
        localStorage.setItem(KEYS.checks, JSON.stringify(saved));
        toast(box.checked ? '준비 완료로 표시했습니다.' : '체크를 해제했습니다.');
      });
    });
  }

  function setupShare() {
    document.querySelectorAll('[data-share]').forEach((button) => {
      button.addEventListener('click', async () => {
        const plan = localStorage.getItem(KEYS.plan);
        const data = {
          title: 'RIVER TO SCREEN',
          text: `산청 래프팅·진주·사천 당일치기${PLANS[plan] ? ` · ${PLANS[plan]}` : ''}`,
          url: location.href
        };
        try {
          if (navigator.share) {
            await navigator.share(data);
          } else {
            await navigator.clipboard.writeText(location.href);
            toast('링크를 복사했습니다.');
          }
        } catch (error) {
          if (error.name !== 'AbortError') toast('주소창의 링크를 복사해 주세요.');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupCountdown();
    setupPlans();
    setupChecks();
    setupShare();
  });
})();
