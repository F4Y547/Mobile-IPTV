const AUTH_STORAGE_KEY = 'syntv_admin_session';

async function checkAdminAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    showLoginPage();
    return null;
  }

  try {
    const result = await adminFetch('admin-check');
    if (!result.isAdmin) {
      await supabase.auth.signOut();
      showLoginPage();
      return null;
    }
    return session;
  } catch (err) {
    await supabase.auth.signOut();
    showLoginPage();
    return null;
  }
}

async function adminLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const result = await adminFetch('admin-check');
  if (!result.isAdmin) {
    await supabase.auth.signOut();
    throw new Error('Access denied. Admin privileges required.');
  }

  return data;
}

async function adminLogout() {
  await supabase.auth.signOut();
  showLoginPage();
}

function showLoginPage() {
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('app-page').classList.add('hidden');
}

function showAppPage() {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('app-page').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorEl = document.getElementById('login-error');
      const btn = loginForm.querySelector('button');

      errorEl.classList.add('hidden');
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      try {
        await adminLogin(email, password);
        showAppPage();
        await initAdminApp();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', adminLogout);
  }
});
