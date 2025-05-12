
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IsoLeadsTable } from "../IsoLeadsTable";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMockLead, mockOnEdit, mockOnNotes, mockOnAssign, resetMocks } from "./utils/IsoLeadTestUtils";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      update: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    })
  }
}));

// Mock the toast component
vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe("IsoLeadsTable Button Interactions", () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const mockLead = createMockLead();
    const user = userEvent.setup();
    
    render(
      <IsoLeadsTable
        leads={[mockLead]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign}
      />
    );

    const editButton = screen.getAllByRole("button")[0]; // First button is edit
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockLead);
  });

  it("calls onNotes when notes button is clicked", async () => {
    const mockLead = createMockLead();
    const user = userEvent.setup();
    
    render(
      <IsoLeadsTable
        leads={[mockLead]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign}
      />
    );

    const notesButton = screen.getAllByRole("button")[1]; // Second button is notes
    await user.click(notesButton);

    expect(mockOnNotes).toHaveBeenCalledWith(mockLead);
  });

  it("calls onAssign when assign button is clicked", async () => {
    const mockLead = createMockLead();
    const user = userEvent.setup();
    
    render(
      <IsoLeadsTable
        leads={[mockLead]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign}
      />
    );

    const assignButton = screen.getAllByRole("button")[2]; // Third button is assign
    await user.click(assignButton);

    expect(mockOnAssign).toHaveBeenCalledWith(mockLead);
  });
});
