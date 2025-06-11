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
  DialogDescription,
  DialogFooter,
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
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Filter out the owner from members list to avoid duplication
  const membersWithoutOwner = members.filter(member => member.id !== owner.id);

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

  const openRemoveDialog = (member: Member) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    
    try {
      setIsRemoving(true);
      await onRemoveMember(memberToRemove.id);
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
      toast.success('Member removed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1e1e1e] border-[#333]">
        <DialogHeader>
          <DialogTitle className="text-white">Project Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Owner */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">Owner</h3>
            <div className="flex items-center justify-between p-3 rounded-md bg-[#2a2a2a] border border-[#333]">
              <div>
                <p className="font-medium text-white">{owner.name}</p>
                <p className="text-sm text-gray-400">{owner.email}</p>
              </div>
              <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                Owner
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">Members</h3>
            {membersWithoutOwner.length === 0 ? (
              <p className="text-sm text-gray-400">No members yet</p>
            ) : (
              <div className="space-y-2">
                {membersWithoutOwner.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-md bg-[#2a2a2a] border border-[#333] hover:bg-[#323232] transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white">{member.name}</p>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>
                    {currentUser.id === owner.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => openRemoveDialog(member)}
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
              <h3 className="text-sm font-medium text-white">Add Member</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-[#2a2a2a] border-[#333] text-white placeholder:text-gray-500"
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

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="bg-[#1e1e1e] border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-white">Remove Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove <span className="font-medium text-white">{memberToRemove?.name}</span> from this project? 
              They will lose access to all project files and data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
              disabled={isRemoving}
              className="bg-transparent border-[#333] text-white hover:bg-[#2a2a2a]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  Removing...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Remove Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
} 