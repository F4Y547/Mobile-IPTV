// ============================================================================
// Admin API Layer - All admin operations
// ============================================================================

async function initAdminApp() {
  await loadDashboard();
  setupNavigation();
}

function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      await navigateTo(page);
    });
  });
}

async function navigateTo(page) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
  const section = document.getElementById(`page-${page}`);
  if (section) section.classList.remove('hidden');

  switch (page) {
    case 'dashboard': await loadDashboard(); break;
    case 'users': await loadUsers(); break;
    case 'playlists': await loadPlaylists(); break;
    case 'announcements': await loadAnnouncements(); break;
    case 'settings': await loadSettings(); break;
  }
}

// ============================================================================
// DASHBOARD
// ============================================================================
async function loadDashboard() {
  try {
    const { data: stats } = await supabase.rpc('get_admin_stats').catch(() => ({
      total_users: 0, free_users: 0, premium_users: 0,
    }));

    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true });

    const { count: freeUsers } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('subscription_status', 'free');

    const { count: activeUsers } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    const { count: expiredUsers } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('subscription_status', 'expired');

    const { count: totalPlaylists } = await supabase
      .from('playlists')
      .select('id', { count: 'exact', head: true });

    const { count: totalChannels } = await supabase
      .from('channels')
      .select('id', { count: 'exact', head: true });

    const { data: recentUsers } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentPlaylists } = await supabase
      .from('playlists')
      .select('*, user_profiles!inner(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(5);

    document.getElementById('stat-total-users').textContent = totalUsers || 0;
    document.getElementById('stat-free-users').textContent = freeUsers || 0;
    document.getElementById('stat-active-users').textContent = activeUsers || 0;
    document.getElementById('stat-expired-users').textContent = expiredUsers || 0;
    document.getElementById('stat-total-playlists').textContent = totalPlaylists || 0;
    document.getElementById('stat-total-channels').textContent = totalChannels || 0;

    const estimateRevenue = (activeUsers || 0) * 9.99;
    document.getElementById('stat-revenue').textContent = `$${estimateRevenue.toFixed(2)}`;

    const recentUsersHtml = (recentUsers || []).map(u => `
      <div class="flex items-center gap-3 p-2 hover:bg-[#101827] rounded-lg">
        <div class="w-8 h-8 rounded-full bg-[#00AEEF]/20 flex items-center justify-center">
          <span class="text-[#00AEEF] text-xs font-bold">${(u.full_name || 'U')[0].toUpperCase()}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[#F8FAFC] text-sm truncate">${u.full_name || 'Unknown'}</p>
          <p class="text-[#94A3B8] text-xs truncate">${u.email || ''}</p>
        </div>
        <span class="text-xs ${u.subscription_status === 'active' ? 'text-[#22C55E]' : 'text-[#94A3B8]'}">${u.subscription_status}</span>
      </div>
    `).join('');
    document.getElementById('recent-users').innerHTML = recentUsersHtml || '<p class="text-[#64748B] text-sm">No users yet</p>';

    const recentPlaylistsHtml = (recentPlaylists || []).map(p => `
      <div class="flex items-center gap-3 p-2 hover:bg-[#101827] rounded-lg">
        <div class="flex-1 min-w-0">
          <p class="text-[#F8FAFC] text-sm truncate">${p.name || 'Unnamed'}</p>
          <p class="text-[#94A3B8] text-xs">${p.user_profiles?.full_name || 'Unknown'} - ${p.type}</p>
        </div>
        <span class="text-xs text-[#94A3B8]">${p.total_channels || 0} ch</span>
      </div>
    `).join('');
    document.getElementById('recent-playlists').innerHTML = recentPlaylistsHtml || '<p class="text-[#64748B] text-sm">No playlists yet</p>';

    document.getElementById('page-dashboard').classList.remove('hidden');
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

// ============================================================================
// USERS MANAGEMENT
// ============================================================================
let allUsers = [];
let userFilter = 'all';

async function loadUsers() {
  try {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    allUsers = users || [];
    renderUsers();

    document.getElementById('user-search').addEventListener('input', renderUsers);
    document.querySelectorAll('.user-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.user-filter-btn').forEach(b => b.classList.remove('active-filter'));
        btn.classList.add('active-filter');
        userFilter = btn.dataset.filter;
        renderUsers();
      });
    });
  } catch (err) {
    console.error('Users load error:', err);
  }
}

function renderUsers() {
  const search = (document.getElementById('user-search')?.value || '').toLowerCase();
  const filtered = allUsers.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search);
    let matchFilter = true;
    if (userFilter === 'free') matchFilter = u.subscription_status === 'free';
    else if (userFilter === 'active') matchFilter = u.subscription_status === 'active';
    else if (userFilter === 'expired') matchFilter = u.subscription_status === 'expired';
    else if (userFilter === 'admin') matchFilter = u.role === 'admin';
    return matchSearch && matchFilter;
  });

  const tbody = document.querySelector('#users-table tbody');
  tbody.innerHTML = filtered.map(u => `
    <tr class="hover:bg-[#101827] border-b border-white/5">
      <td class="p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-[#00AEEF]/20 flex items-center justify-center">
            <span class="text-[#00AEEF] text-xs font-bold">${(u.full_name || 'U')[0].toUpperCase()}</span>
          </div>
          <div>
            <p class="text-[#F8FAFC] text-sm">${u.full_name || 'Unknown'}</p>
            <p class="text-[#94A3B8] text-xs">${u.email || ''}</p>
          </div>
        </div>
      </td>
      <td class="p-3">
        <span class="px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'bg-[#101827] text-[#94A3B8]'}">${u.role}</span>
      </td>
      <td class="p-3">
        <span class="px-2 py-1 text-xs rounded-full ${
          u.subscription_status === 'active' ? 'bg-[#22C55E]/20 text-[#22C55E]' :
          u.subscription_status === 'free' ? 'bg-[#64748B]/20 text-[#64748B]' :
          'bg-[#EF4444]/20 text-[#EF4444]'
        }">${u.subscription_status}</span>
      </td>
      <td class="p-3 text-[#94A3B8] text-xs">${u.subscription_plan || 'free'}</td>
      <td class="p-3 text-[#94A3B8] text-xs">${u.subscription_expires_at ? new Date(u.subscription_expires_at).toLocaleDateString() : '-'}</td>
      <td class="p-3 text-[#94A3B8] text-xs">${new Date(u.created_at).toLocaleDateString()}</td>
      <td class="p-3">
        <div class="flex gap-1">
          <button onclick="showUserModal('${u.id}')" class="p-1.5 rounded hover:bg-[#00AEEF]/20 text-[#00AEEF]" title="Edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="p-6 text-center text-[#64748B]">No users found</td></tr>';
}

async function showUserModal(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;

  document.getElementById('modal-user-id').value = user.id;
  document.getElementById('modal-user-name').textContent = user.full_name || 'Unknown';
  document.getElementById('modal-user-email').textContent = user.email || '';
  document.getElementById('modal-subscription-plan').value = user.subscription_plan || 'free';
  document.getElementById('modal-subscription-status').value = user.subscription_status || 'free';
  document.getElementById('modal-expiry-date').value = user.subscription_expires_at
    ? new Date(user.subscription_expires_at).toISOString().split('T')[0]
    : '';
  document.getElementById('modal-user-role').value = user.role || 'user';
  document.getElementById('modal-is-disabled').checked = user.is_disabled || false;

  document.getElementById('user-modal').classList.remove('hidden');
}

function closeUserModal() {
  document.getElementById('user-modal').classList.add('hidden');
}

async function saveUserChanges() {
  const userId = document.getElementById('modal-user-id').value;
  const plan = document.getElementById('modal-subscription-plan').value;
  const status = document.getElementById('modal-subscription-status').value;
  const expiryDate = document.getElementById('modal-expiry-date').value;
  const role = document.getElementById('modal-user-role').value;
  const isDisabled = document.getElementById('modal-is-disabled').checked;

  try {
    const updateData = {
      subscription_plan: plan,
      subscription_status: status,
      role,
      is_disabled: isDisabled,
    };
    if (expiryDate) {
      updateData.subscription_expires_at = new Date(expiryDate).toISOString();
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;

    // If activating premium, create/update subscription record
    if (status === 'active' && plan !== 'free') {
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', allUsers.find(u => u.id === userId)?.user_id)
        .eq('status', 'active')
        .maybeSingle();

      if (!existingSub) {
        const expiresAt = expiryDate
          ? new Date(expiryDate).toISOString()
          : new Date(Date.now() + 30 * 86400000).toISOString();

        await supabase.from('subscriptions').insert({
          user_id: allUsers.find(u => u.id === userId)?.user_id,
          plan_name: plan,
          status: 'active',
          payment_provider: 'manual',
          starts_at: new Date().toISOString(),
          expires_at: expiresAt,
        });
      }
    }

    closeUserModal();
    await loadUsers();
    showToast('User updated successfully', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// PLAYLISTS MANAGEMENT
// ============================================================================
let allPlaylists = [];

async function loadPlaylists() {
  try {
    const { data: playlists, error } = await supabase
      .from('playlists')
      .select('*, user_profiles!inner(full_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    allPlaylists = playlists || [];
    renderPlaylists();
  } catch (err) {
    console.error('Playlists load error:', err);
  }
}

function renderPlaylists() {
  const tbody = document.querySelector('#playlists-table tbody');
  tbody.innerHTML = allPlaylists.map(p => `
    <tr class="hover:bg-[#101827] border-b border-white/5">
      <td class="p-3">
        <p class="text-[#F8FAFC] text-sm">${p.name || 'Unnamed'}</p>
        <p class="text-[#94A3B8] text-xs">${p.user_profiles?.full_name || 'Unknown'}</p>
      </td>
      <td class="p-3">
        <span class="px-2 py-1 text-xs rounded-full ${
          p.type === 'm3u' ? 'bg-[#00AEEF]/20 text-[#00AEEF]' : 'bg-[#7C3AED]/20 text-[#7C3AED]'
        }">${p.type}</span>
      </td>
      <td class="p-3 text-[#94A3B8] text-xs">${p.total_channels || 0}</td>
      <td class="p-3 text-[#94A3B8] text-xs">${p.total_movies || 0}</td>
      <td class="p-3 text-[#94A3B8] text-xs">${p.total_series || 0}</td>
      <td class="p-3">
        <span class="px-2 py-1 text-xs rounded-full ${
          p.status === 'active' ? 'bg-[#22C55E]/20 text-[#22C55E]' :
          p.status === 'suspicious' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
          p.status === 'error' ? 'bg-[#EF4444]/20 text-[#EF4444]' :
          'bg-[#64748B]/20 text-[#64748B]'
        }">${p.status}</span>
      </td>
      <td class="p-3 text-[#94A3B8] text-xs">${p.last_synced_at ? new Date(p.last_synced_at).toLocaleDateString() : '-'}</td>
      <td class="p-3">
        <div class="flex gap-1">
          <button onclick="togglePlaylistStatus('${p.id}', '${p.status === 'active' ? 'inactive' : 'active'}')" class="p-1.5 rounded hover:bg-[#00AEEF]/20 text-[#00AEEF]" title="Toggle status">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </button>
          <button onclick="markPlaylistSuspicious('${p.id}')" class="p-1.5 rounded hover:bg-[#F59E0B]/20 text-[#F59E0B]" title="Mark suspicious">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
          </button>
          <button onclick="deletePlaylist('${p.id}')" class="p-1.5 rounded hover:bg-[#EF4444]/20 text-[#EF4444]" title="Delete">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="8" class="p-6 text-center text-[#64748B]">No playlists found</td></tr>';
}

async function togglePlaylistStatus(id, newStatus) {
  try {
    const { error } = await supabase
      .from('playlists')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) throw error;
    await loadPlaylists();
    showToast(`Playlist ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function markPlaylistSuspicious(id) {
  try {
    const { error } = await supabase
      .from('playlists')
      .update({ is_suspicious: true, status: 'suspicious' })
      .eq('id', id);
    if (error) throw error;
    await loadPlaylists();
    showToast('Playlist marked as suspicious', 'warning');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deletePlaylist(id) {
  if (!confirm('Delete this playlist and all its data? This cannot be undone.')) return;
  try {
    await supabase.from('epg_programs').delete().eq('playlist_id', id);
    await supabase.from('channels').delete().eq('playlist_id', id);
    await supabase.from('movies').delete().eq('playlist_id', id);
    await supabase.from('series').delete().eq('playlist_id', id);
    const { error } = await supabase.from('playlists').delete().eq('id', id);
    if (error) throw error;
    await loadPlaylists();
    showToast('Playlist deleted', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// ANNOUNCEMENTS MANAGEMENT
// ============================================================================
let allAnnouncements = [];

async function loadAnnouncements() {
  try {
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    allAnnouncements = announcements || [];
    renderAnnouncements();
  } catch (err) {
    console.error('Announcements load error:', err);
  }
}

function renderAnnouncements() {
  const tbody = document.querySelector('#announcements-table tbody');
  tbody.innerHTML = allAnnouncements.map(a => `
    <tr class="hover:bg-[#101827] border-b border-white/5">
      <td class="p-3 text-[#F8FAFC] text-sm">${a.title}</td>
      <td class="p-3 text-[#94A3B8] text-xs max-w-[300px] truncate">${a.message}</td>
      <td class="p-3">
        <span class="px-2 py-1 text-xs rounded-full ${
          a.type === 'info' ? 'bg-[#00AEEF]/20 text-[#00AEEF]' :
          a.type === 'warning' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
          a.type === 'success' ? 'bg-[#22C55E]/20 text-[#22C55E]' :
          'bg-[#EF4444]/20 text-[#EF4444]'
        }">${a.type}</span>
      </td>
      <td class="p-3">
        <span class="px-2 py-1 text-xs rounded-full ${a.is_active ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#64748B]/20 text-[#64748B]'}">${a.is_active ? 'Active' : 'Inactive'}</span>
      </td>
      <td class="p-3 text-[#94A3B8] text-xs">${new Date(a.created_at).toLocaleDateString()}</td>
      <td class="p-3">
        <div class="flex gap-1">
          <button onclick="editAnnouncement('${a.id}')" class="p-1.5 rounded hover:bg-[#00AEEF]/20 text-[#00AEEF]" title="Edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="toggleAnnouncement('${a.id}')" class="p-1.5 rounded hover:bg-[#22C55E]/20 text-[#22C55E]" title="Toggle active">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </button>
          <button onclick="deleteAnnouncement('${a.id}')" class="p-1.5 rounded hover:bg-[#EF4444]/20 text-[#EF4444]" title="Delete">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="p-6 text-center text-[#64748B]">No announcements</td></tr>';
}

function showAnnouncementForm(data) {
  if (data) {
    document.getElementById('announcement-id').value = data.id;
    document.getElementById('announcement-title').value = data.title;
    document.getElementById('announcement-message').value = data.message;
    document.getElementById('announcement-type').value = data.type;
  } else {
    document.getElementById('announcement-id').value = '';
    document.getElementById('announcement-title').value = '';
    document.getElementById('announcement-message').value = '';
    document.getElementById('announcement-type').value = 'info';
  }
  document.getElementById('announcement-modal').classList.remove('hidden');
}

function editAnnouncement(id) {
  const data = allAnnouncements.find(a => a.id === id);
  if (data) showAnnouncementForm(data);
}

function closeAnnouncementModal() {
  document.getElementById('announcement-modal').classList.add('hidden');
}

async function saveAnnouncement() {
  const id = document.getElementById('announcement-id').value;
  const title = document.getElementById('announcement-title').value;
  const message = document.getElementById('announcement-message').value;
  const type = document.getElementById('announcement-type').value;

  if (!title || !message) {
    showToast('Title and message are required', 'error');
    return;
  }

  try {
    if (id) {
      const { error } = await supabase
        .from('announcements')
        .update({ title, message, type })
        .eq('id', id);
      if (error) throw error;
      showToast('Announcement updated', 'success');
    } else {
      const { error } = await supabase
        .from('announcements')
        .insert({ title, message, type });
      if (error) throw error;
      showToast('Announcement created', 'success');
    }
    closeAnnouncementModal();
    await loadAnnouncements();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleAnnouncement(id) {
  const ann = allAnnouncements.find(a => a.id === id);
  if (!ann) return;
  try {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: !ann.is_active })
      .eq('id', id);
    if (error) throw error;
    await loadAnnouncements();
    showToast(`Announcement ${ann.is_active ? 'unpublished' : 'published'}`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteAnnouncement(id) {
  if (!confirm('Delete this announcement?')) return;
  try {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    await loadAnnouncements();
    showToast('Announcement deleted', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// APP SETTINGS
// ============================================================================
async function loadSettings() {
  try {
    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('key, value');

    if (error) throw error;

    const settingMap = {};
    (settings || []).forEach(s => { settingMap[s.key] = s.value; });

    document.getElementById('setting-app-name').value = settingMap.app_name || 'SYNTV Online';
    document.getElementById('setting-logo-url').value = settingMap.logo_url || '';
    document.getElementById('setting-support-email').value = settingMap.support_email || '';
    document.getElementById('setting-support-whatsapp').value = settingMap.support_whatsapp || '';
    document.getElementById('setting-min-version').value = settingMap.min_app_version || '2.0.0';
    document.getElementById('setting-legal-disclaimer').value = settingMap.legal_disclaimer || '';
    document.getElementById('setting-maintenance-mode').checked = settingMap.maintenance_mode === true;
    document.getElementById('setting-free-playlists').value = settingMap.free_plan_limits?.playlists || 1;
    document.getElementById('setting-free-favorites').value = settingMap.free_plan_limits?.favorites || 10;
    document.getElementById('setting-premium-playlists').value = settingMap.premium_plan_limits?.playlists || 999;
    document.getElementById('setting-premium-favorites').value = settingMap.premium_plan_limits?.favorites || 9999;
    document.getElementById('setting-premium-epg').checked = settingMap.premium_plan_limits?.epg !== false;
    document.getElementById('setting-premium-vod').checked = settingMap.premium_plan_limits?.vod !== false;

    document.getElementById('settings-form').onsubmit = saveSettings;
  } catch (err) {
    console.error('Settings load error:', err);
  }
}

async function saveSettings(e) {
  e.preventDefault();

  const settings = [
    { key: 'app_name', value: document.getElementById('setting-app-name').value },
    { key: 'logo_url', value: document.getElementById('setting-logo-url').value },
    { key: 'support_email', value: document.getElementById('setting-support-email').value },
    { key: 'support_whatsapp', value: document.getElementById('setting-support-whatsapp').value },
    { key: 'min_app_version', value: document.getElementById('setting-min-version').value },
    { key: 'legal_disclaimer', value: document.getElementById('setting-legal-disclaimer').value },
    { key: 'maintenance_mode', value: document.getElementById('setting-maintenance-mode').checked },
    { key: 'free_plan_limits', value: {
        playlists: parseInt(document.getElementById('setting-free-playlists').value) || 1,
        favorites: parseInt(document.getElementById('setting-free-favorites').value) || 10,
        epg: false,
        vod: false,
        max_bitrate: 'SD',
    }},
    { key: 'premium_plan_limits', value: {
        playlists: parseInt(document.getElementById('setting-premium-playlists').value) || 999,
        favorites: parseInt(document.getElementById('setting-premium-favorites').value) || 9999,
        epg: document.getElementById('setting-premium-epg').checked,
        vod: document.getElementById('setting-premium-vod').checked,
        max_bitrate: 'FHD',
    }},
  ];

  try {
    for (const s of settings) {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: s.key, value: s.value }, { onConflict: 'key' });
      if (error) throw error;
    }
    showToast('Settings saved successfully', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// TOAST NOTIFICATION
// ============================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const colors = {
    success: 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E]',
    error: 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]',
    warning: 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]',
    info: 'bg-[#00AEEF]/20 border-[#00AEEF] text-[#00AEEF]',
  };
  toast.className = `px-4 py-3 rounded-lg border ${colors[type] || colors.info} text-sm animate-slide-up`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 4000);
}
