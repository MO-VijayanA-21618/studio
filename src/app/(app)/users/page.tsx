'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '@/lib/firebase/users';
import { UserData } from '@/lib/types/user';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserDialog } from '@/components/users/UserDialog';

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (confirm('Delete this user?')) {
      await deleteUser(userId);
      loadUsers();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => { setSelectedUser(null); setIsDialogOpen(true); }}>Add User</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell><Badge>{user.role}</Badge></TableCell>
              <TableCell><Badge variant={user.isActive ? 'default' : 'secondary'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setIsDialogOpen(true); }}>Edit</Button>
                <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDelete(user.id!)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <UserDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} user={selectedUser} onSuccess={loadUsers} />
    </div>
  );
}
