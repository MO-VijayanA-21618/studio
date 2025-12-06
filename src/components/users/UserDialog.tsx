'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { createUser, updateUser } from '@/lib/firebase/users';
import { UserData, Role, defaultPermissions, Permission } from '@/lib/types/user';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PermissionsEditor } from './PermissionsEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onSuccess: () => void;
}

export function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'staff' as Role, isActive: true });
  const [permissions, setPermissions] = useState<Permission>(defaultPermissions.staff);

  useEffect(() => {
    if (user) {
      setFormData({ email: user.email, password: '', name: user.name, role: user.role, isActive: user.isActive });
      setPermissions(user.permissions);
    } else {
      setFormData({ email: '', password: '', name: '', role: 'staff', isActive: true });
      setPermissions(defaultPermissions.staff);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user) {
        await updateUser(user.id!, { name: formData.name, role: formData.role, isActive: formData.isActive, permissions });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await createUser(userCredential.user.uid, { email: formData.email, name: formData.name, role: formData.role, permissions, isActive: formData.isActive });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!!user} required />
              </div>
              {!user && (
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                </div>
              )}
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(value) => { setFormData({ ...formData, role: value as Role }); setPermissions(defaultPermissions[value as Role]); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
                <Label>Active</Label>
              </div>
            </TabsContent>
            <TabsContent value="permissions">
              <PermissionsEditor permissions={permissions} onChange={setPermissions} />
            </TabsContent>
          </Tabs>
          <Button type="submit" className="w-full">{user ? 'Update' : 'Create'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
