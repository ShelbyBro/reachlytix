
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUserManagement } from "../hooks/use-user-management";

export function UserManagement() {
  const { users, loadingUsers, updateUserRole } = useUserManagement();

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingUsers ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 font-medium text-sm text-muted-foreground py-2 border-b">
              <div>Name</div>
              <div>Role</div>
              <div>Created</div>
              <div>Actions</div>
            </div>
            
            {users.map(user => (
              <div key={user.id} className="grid grid-cols-4 py-2 border-b items-center">
                <div>{user.first_name} {user.last_name}</div>
                <div className="capitalize">{user.role}</div>
                <div>{new Date(user.created_at).toLocaleDateString()}</div>
                <div>
                  <select 
                    className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value as "admin" | "client" | "agent")}
                  >
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-muted-foreground">No users found</p>
        )}
      </CardContent>
    </Card>
  );
}
