import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, Badge } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/store/useToast';
import { authApi, habitApi, taskApi } from '@/lib/api';
import { todayKey, formatLong } from '@/lib/date';

export function Profile() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [nameOpen, setNameOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [savingName, setSavingName] = useState(false);

  if (!user) return null;

  const openNameModal = () => {
    setName(user.name);
    setNameError(undefined);
    setNameOpen(true);
  };

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }
    setSavingName(true);
    try {
      const { user: updated } = await authApi.updateProfile({ name: trimmed });
      setUser(updated);
      toast.success('Name updated');
      setNameOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingName(false);
    }
  };

  const handleExport = async () => {
    try {
      const [habits, tasks] = await Promise.all([habitApi.list(), taskApi.list()]);
      const payload = {
        exportedAt: new Date().toISOString(),
        user: {
          name: user.name,
          email: user.email,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
        },
        habits: habits.habits,
        tasks: tasks.tasks,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dayplanner-export-${todayKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={openNameModal}>
            Edit name
          </Button>
        </div>
      </Card>

      <Modal open={nameOpen} onClose={() => setNameOpen(false)} title="Edit name">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name-input">Name</Label>
            <Input
              id="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              autoFocus
            />
            <FieldError message={nameError} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setNameOpen(false)} disabled={savingName}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveName} loading={savingName}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Current Streak</p>
          <p className="mt-1 text-2xl font-bold">🔥 {user.currentStreak}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Longest Streak</p>
          <p className="mt-1 text-2xl font-bold">🏆 {user.longestStreak}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Member Since</p>
          <p className="mt-1 text-sm font-semibold">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </Card>
      </div>

      {user.lastStreakDate && (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Last successful streak day:{' '}
            <Badge variant="success">{formatLong(user.lastStreakDate)}</Badge>
          </p>
        </Card>
      )}

      <Card>
        <CardHeader title="Data" subtitle="Export your habits and tasks." />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExport}>
            ⬇ Export my data
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </Card>
    </div>
  );
}
