
import { render, screen } from "@testing-library/react";
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

describe("IsoLeadsTable Data Rendering", () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
  });

  it("renders leads correctly", () => {
    const mockLeads = [createMockLead()];
    
    render(
      <IsoLeadsTable
        leads={mockLeads}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign}
      />
    );

    expect(screen.getByText("Test Lead")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("123-456-7890", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("handles leads with missing data", () => {
    const leadWithMissingData = createMockLead({
      lead: {
        name: "",
        email: null,
        phone: undefined,
        source: null
      },
      assigned_agent: null,
      notes: ""
    });

    render(
      <IsoLeadsTable
        leads={[leadWithMissingData]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign}
      />
    );

    // Check if fallback values are displayed
    expect(screen.getAllByText("N/A")).not.toHaveLength(0);
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("No notes")).toBeInTheDocument();
  });

  it("handles long notes with ellipsis", () => {
    const leadWithLongNotes = createMockLead({
      notes: "This is a very long note that should be truncated when displayed in the table to prevent it from taking up too much space and making the UI look cluttered and messy."
    });

    render(
      <IsoLeadsTable
        leads={[leadWithLongNotes]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign}
      />
    );

    // The note should be rendered with the line-clamp class
    const noteElement = screen.getByText(/This is a very long note/);
    expect(noteElement).toHaveClass("line-clamp-1");
  });
  
  it("properly handles agent name display with nullable fields", () => {
    // Test with null first name
    const leadWithNullFirstName = createMockLead({
      assigned_agent: { first_name: null, last_name: "Doe" }
    });
    
    // Test with null last name
    const leadWithNullLastName = createMockLead({
      assigned_agent: { first_name: "John", last_name: null }
    });
    
    // Test with both null
    const leadWithBothNullNames = createMockLead({
      assigned_agent: { first_name: null, last_name: null }
    });
    
    render(
      <IsoLeadsTable
        leads={[leadWithNullFirstName, leadWithNullLastName, leadWithBothNullNames]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign}
      />
    );
    
    expect(screen.getByText("Doe")).toBeInTheDocument(); // Only last name
    expect(screen.getByText("John")).toBeInTheDocument(); // Only first name
    expect(screen.getByText("N/A")).toBeInTheDocument(); // Both null shows N/A
  });
});
