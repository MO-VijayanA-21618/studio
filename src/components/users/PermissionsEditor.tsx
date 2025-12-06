'use client';

import { Permission } from '@/lib/types/user';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PermissionsEditorProps {
  permissions: Permission;
  onChange: (permissions: Permission) => void;
}

export function PermissionsEditor({ permissions, onChange }: PermissionsEditorProps) {
  const updatePermission = (module: keyof Permission, action: 'create' | 'read' | 'update' | 'delete', value: boolean) => {
    onChange({
      ...permissions,
      [module]: { ...permissions[module], [action]: value }
    });
  };

  return (
    <div className="space-y-4">
      {(['loans', 'accounting', 'users'] as const).map(module => (
        <div key={module} className="border p-3 rounded">
          <h4 className="font-semibold mb-2 capitalize">{module}</h4>
          <div className="grid grid-cols-2 gap-2">
            {(['create', 'read', 'update', 'delete'] as const).map(action => (
              <div key={action} className="flex items-center space-x-2">
                <Switch
                  checked={permissions[module][action]}
                  onCheckedChange={(checked) => updatePermission(module, action, checked)}
                />
                <Label className="capitalize">{action}</Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
