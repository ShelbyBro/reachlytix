
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface EmailContentFieldsProps {
  subject: string;
  content: string;
  onSubjectChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export function EmailContentFields({
  subject,
  content,
  onSubjectChange,
  onContentChange
}: EmailContentFieldsProps) {
  const { role } = useAuth();
  const isReadOnly = role === "agent"; // Agents can view but not edit

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="subject">Email Subject</label>
        <Input
          id="subject"
          placeholder="Email Subject"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-muted" : ""}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="content">Email Content</label>
        <Textarea
          id="content"
          rows={8}
          placeholder="Email Content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-muted" : ""}
        />
      </div>
    </>
  );
}
