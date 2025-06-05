import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Users, UserPlus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface ProjectMembersProps {
  members: Member[];
  owner: Member;
  currentUser: Member;
  onAddMember: (email: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

export function ProjectMembers({
  members,
  owner,
  currentUser,
  onAddMember,
  onRemoveMember,
}: ProjectMembersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      await onAddMember(email);
      setEmail('');
      setIsOpen(false);
      toast.success('Member added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await onRemoveMember(userId);
      toast.success('Member removed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Owner */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Owner</h3>
            <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
              <div>
                <p className="font-medium">{owner.name}</p>
                <p className="text-sm text-muted-foreground">{owner.email}</p>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Members</h3>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members yet</p>
            ) : (
              <div className="space-y-2">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-md bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    {currentUser.id === owner.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add member form */}
          {currentUser.id === owner.id && (
            <form onSubmit={handleAddMember} className="space-y-2">
              <h3 className="text-sm font-medium">Add Member</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !email}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 